import * as pdfjsLib from 'pdfjs-dist';
import { ResumeData } from './resume-types';
import { StorageManager } from './storage';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;
}

export class PDFParser {
  private static emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  private static phoneRegex = /(\+?\d{1,4}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g;
  private static linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/g;
  private static githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9-]+/g;
  private static urlRegex = /https?:\/\/[^\s]+/g;

  static async parseResumePDF(file: File): Promise<ResumeData> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return this.parseTextToResumeData(fullText);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF. Please ensure the file is a valid PDF document.');
    }
  }

  private static parseTextToResumeData(text: string): ResumeData {
    const resume = StorageManager.createEmptyResume();
    
    // Clean and normalize text
    const cleanText = text.replace(/\s+/g, ' ').trim();
    const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract personal information
    resume.personalInfo = this.extractPersonalInfo(cleanText, lines);
    
    // Extract sections
    resume.summary = this.extractSummary(cleanText, lines);
    resume.experience = this.extractExperience(cleanText, lines);
    resume.education = this.extractEducation(cleanText, lines);
    resume.skills = this.extractSkills(cleanText, lines);
    resume.certifications = this.extractCertifications(cleanText, lines);
    resume.languages = this.extractLanguages(cleanText, lines);
    
    // Set title based on name
    resume.title = resume.personalInfo.fullName ? `${resume.personalInfo.fullName} - Resume` : 'Imported Resume';
    
    return resume;
  }

  private static extractPersonalInfo(text: string, lines: string[]) {
    const personalInfo = {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: ''
    };

    // Extract name (usually the first significant line)
    const nameCandidate = lines.find(line => 
      line.length > 2 && 
      line.length < 50 && 
      !line.includes('@') && 
      !line.includes('http') &&
      /^[A-Za-z\s]+$/.test(line) &&
      line.split(' ').length >= 2
    );
    if (nameCandidate) {
      personalInfo.fullName = nameCandidate;
    }

    // Extract email
    const emailMatch = text.match(this.emailRegex);
    if (emailMatch) {
      personalInfo.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = text.match(this.phoneRegex);
    if (phoneMatch) {
      personalInfo.phone = phoneMatch[0];
    }

    // Extract LinkedIn
    const linkedinMatch = text.match(this.linkedinRegex);
    if (linkedinMatch) {
      personalInfo.linkedin = linkedinMatch[0];
    }

    // Extract GitHub
    const githubMatch = text.match(this.githubRegex);
    if (githubMatch) {
      personalInfo.github = githubMatch[0];
    }

    // Extract location (look for patterns like "City, State" or "City, Country")
    const locationPatterns = [
      /([A-Za-z\s]+,\s*[A-Za-z\s]+,\s*[A-Za-z\s]+)/g, // City, State, Country
      /([A-Za-z\s]+,\s*[A-Za-z\s]+)/g // City, State/Country
    ];
    
    for (const pattern of locationPatterns) {
      const locationMatch = text.match(pattern);
      if (locationMatch) {
        const location = locationMatch[0];
        if (!location.includes('@') && !location.includes('http')) {
          personalInfo.location = location;
          break;
        }
      }
    }

    return personalInfo;
  }

  private static extractSummary(text: string, lines: string[]): string {
    const summaryKeywords = ['summary', 'profile', 'objective', 'about'];
    const summaryIndex = lines.findIndex(line => 
      summaryKeywords.some(keyword => 
        line.toLowerCase().includes(keyword) && line.length < 30
      )
    );

    if (summaryIndex !== -1) {
      // Look for the next section header to know where summary ends
      const nextSectionIndex = lines.findIndex((line, index) => 
        index > summaryIndex + 1 && 
        (line.toLowerCase().includes('experience') || 
         line.toLowerCase().includes('education') ||
         line.toLowerCase().includes('skills') ||
         line.toLowerCase().includes('work') ||
         line.toUpperCase() === line && line.length < 30)
      );

      const endIndex = nextSectionIndex !== -1 ? nextSectionIndex : summaryIndex + 5;
      const summaryLines = lines.slice(summaryIndex + 1, endIndex);
      return summaryLines.join(' ').trim();
    }

    return '';
  }

  private static extractExperience(text: string, lines: string[]) {
    const experiences = [];
    const experienceKeywords = ['experience', 'work', 'employment', 'career'];
    
    const experienceIndex = lines.findIndex(line => 
      experienceKeywords.some(keyword => 
        line.toLowerCase().includes(keyword) && line.length < 30
      )
    );

    if (experienceIndex === -1) return experiences;

    // Find the next major section
    const nextSectionIndex = lines.findIndex((line, index) => 
      index > experienceIndex + 1 && 
      (line.toLowerCase().includes('education') ||
       line.toLowerCase().includes('skills') ||
       line.toLowerCase().includes('projects') ||
       (line.toUpperCase() === line && line.length < 30 && line.length > 3))
    );

    const experienceLines = lines.slice(
      experienceIndex + 1, 
      nextSectionIndex !== -1 ? nextSectionIndex : lines.length
    );

    let currentExperience = null;
    
    for (const line of experienceLines) {
      // Check if this looks like a job title or company
      if (this.looksLikeJobTitle(line)) {
        if (currentExperience) {
          experiences.push(currentExperience);
        }
        
        currentExperience = {
          id: StorageManager.generateId(),
          company: '',
          position: line,
          startDate: '',
          endDate: '',
          current: false,
          location: '',
          description: []
        };
      } else if (currentExperience && this.looksLikeCompanyInfo(line)) {
        // Parse company, location, and dates
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 2) {
          currentExperience.company = parts[0];
          if (parts[1]) {
            const dateMatch = parts[parts.length - 1].match(/(\w+\s+\d{4})\s*[-–]\s*(\w+\s+\d{4}|Present)/);
            if (dateMatch) {
              currentExperience.startDate = dateMatch[1];
              currentExperience.endDate = dateMatch[2];
              currentExperience.current = dateMatch[2].toLowerCase().includes('present');
            }
          }
          if (parts.length >= 3) {
            currentExperience.location = parts[1];
          }
        }
      } else if (currentExperience && line.startsWith('•') || line.startsWith('-')) {
        // This is a bullet point
        currentExperience.description.push(line.replace(/^[•-]\s*/, ''));
      }
    }

    if (currentExperience) {
      experiences.push(currentExperience);
    }

    return experiences;
  }

  private static extractEducation(text: string, lines: string[]) {
    const education = [];
    const educationKeywords = ['education', 'academic', 'degree'];
    
    const educationIndex = lines.findIndex(line => 
      educationKeywords.some(keyword => 
        line.toLowerCase().includes(keyword) && line.length < 30
      )
    );

    if (educationIndex === -1) return education;

    const nextSectionIndex = lines.findIndex((line, index) => 
      index > educationIndex + 1 && 
      (line.toLowerCase().includes('skills') ||
       line.toLowerCase().includes('projects') ||
       line.toLowerCase().includes('certifications') ||
       (line.toUpperCase() === line && line.length < 30 && line.length > 3))
    );

    const educationLines = lines.slice(
      educationIndex + 1, 
      nextSectionIndex !== -1 ? nextSectionIndex : lines.length
    );

    let currentEducation = null;

    for (const line of educationLines) {
      if (this.looksLikeDegree(line)) {
        if (currentEducation) {
          education.push(currentEducation);
        }
        
        currentEducation = {
          id: StorageManager.generateId(),
          institution: '',
          degree: line,
          field: '',
          graduationDate: '',
          gpa: '',
          coursework: []
        };
      } else if (currentEducation && this.looksLikeInstitution(line)) {
        const parts = line.split('|').map(p => p.trim());
        currentEducation.institution = parts[0];
        
        if (parts.length > 1) {
          const dateMatch = parts[parts.length - 1].match(/\b\d{4}\b/);
          if (dateMatch) {
            currentEducation.graduationDate = dateMatch[0];
          }
        }
      }
    }

    if (currentEducation) {
      education.push(currentEducation);
    }

    return education;
  }

  private static extractSkills(text: string, lines: string[]) {
    const skills = [];
    const skillsKeywords = ['skills', 'technical', 'technologies', 'competencies'];
    
    const skillsIndex = lines.findIndex(line => 
      skillsKeywords.some(keyword => 
        line.toLowerCase().includes(keyword) && line.length < 50
      )
    );

    if (skillsIndex === -1) return skills;

    const nextSectionIndex = lines.findIndex((line, index) => 
      index > skillsIndex + 1 && 
      (line.toLowerCase().includes('experience') ||
       line.toLowerCase().includes('education') ||
       line.toLowerCase().includes('projects') ||
       line.toLowerCase().includes('certifications') ||
       (line.toUpperCase() === line && line.length < 30 && line.length > 3))
    );

    const skillsLines = lines.slice(
      skillsIndex + 1, 
      nextSectionIndex !== -1 ? nextSectionIndex : lines.length
    );

    for (const line of skillsLines) {
      if (line.includes(':')) {
        const [category, skillsList] = line.split(':').map(s => s.trim());
        const skillNames = skillsList.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
        
        for (const skillName of skillNames) {
          skills.push({
            id: StorageManager.generateId(),
            name: skillName,
            category: category,
            level: 'Intermediate' as const
          });
        }
      }
    }

    return skills;
  }

  private static extractCertifications(text: string, lines: string[]) {
    const certifications = [];
    const certKeywords = ['certifications', 'certificates', 'credentials'];
    
    const certIndex = lines.findIndex(line => 
      certKeywords.some(keyword => 
        line.toLowerCase().includes(keyword) && line.length < 30
      )
    );

    if (certIndex === -1) return certifications;

    const nextSectionIndex = lines.findIndex((line, index) => 
      index > certIndex + 1 && 
      (line.toLowerCase().includes('languages') ||
       line.toLowerCase().includes('projects') ||
       (line.toUpperCase() === line && line.length < 30 && line.length > 3))
    );

    const certLines = lines.slice(
      certIndex + 1, 
      nextSectionIndex !== -1 ? nextSectionIndex : lines.length
    );

    for (const line of certLines) {
      if (line.startsWith('•') || line.startsWith('-')) {
        const certText = line.replace(/^[•-]\s*/, '');
        const parts = certText.split('|').map(p => p.trim());
        
        if (parts.length >= 2) {
          certifications.push({
            id: StorageManager.generateId(),
            name: parts[0],
            issuer: parts[1] || '',
            date: parts[2] || '',
            credentialId: '',
            expirationDate: ''
          });
        }
      }
    }

    return certifications;
  }

  private static extractLanguages(text: string, lines: string[]) {
    const languages = [];
    const langKeywords = ['languages', 'language'];
    
    const langIndex = lines.findIndex(line => 
      langKeywords.some(keyword => 
        line.toLowerCase().includes(keyword) && line.length < 30
      )
    );

    if (langIndex === -1) return languages;

    const langLines = lines.slice(langIndex + 1, langIndex + 10);

    for (const line of langLines) {
      if (line.startsWith('•') || line.startsWith('-')) {
        const langText = line.replace(/^[•-]\s*/, '');
        const match = langText.match(/([A-Za-z\s]+)\s*\(([^)]+)\)/);
        
        if (match) {
          languages.push({
            id: StorageManager.generateId(),
            name: match[1].trim(),
            proficiency: this.mapProficiency(match[2].trim())
          });
        }
      }
    }

    return languages;
  }

  private static looksLikeJobTitle(line: string): boolean {
    const jobTitleKeywords = [
      'engineer', 'developer', 'manager', 'analyst', 'specialist', 'coordinator',
      'director', 'lead', 'senior', 'junior', 'intern', 'consultant', 'architect'
    ];
    
    return jobTitleKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    ) && line.length < 100;
  }

  private static looksLikeCompanyInfo(line: string): boolean {
    return line.includes('|') && (
      line.includes('20') || // Year
      line.includes('Present') ||
      line.includes('Current')
    );
  }

  private static looksLikeDegree(line: string): boolean {
    const degreeKeywords = [
      'bachelor', 'master', 'phd', 'doctorate', 'degree', 'diploma',
      'certificate', 'engineering', 'science', 'arts', 'business'
    ];
    
    return degreeKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    ) && line.length < 150;
  }

  private static looksLikeInstitution(line: string): boolean {
    const institutionKeywords = [
      'university', 'college', 'institute', 'school', 'academy'
    ];
    
    return institutionKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    ) || (line.includes('|') && line.includes('20'));
  }

  private static mapProficiency(proficiency: string): 'Native' | 'Fluent' | 'Professional' | 'Conversational' | 'Basic' {
    const lower = proficiency.toLowerCase();
    if (lower.includes('native') || lower.includes('mother')) return 'Native';
    if (lower.includes('fluent') || lower.includes('advanced')) return 'Fluent';
    if (lower.includes('professional') || lower.includes('business')) return 'Professional';
    if (lower.includes('conversational') || lower.includes('intermediate')) return 'Conversational';
    return 'Basic';
  }
}