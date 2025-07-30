import jsPDF from 'jspdf';
import { ResumeData } from './resume-types';

export class PDFGenerator {
  private doc: jsPDF;
  private yPosition: number = 20;
  private pageHeight: number = 280;
  private margin: number = 20;
  private lineHeight: number = 6;

  constructor() {
    this.doc = new jsPDF();
  }

  generateResumePDF(resumeData: ResumeData): jsPDF {
    this.doc = new jsPDF();
    this.yPosition = 20;

    // Set font
    this.doc.setFont('helvetica', 'normal');
    
    const visibleSections = resumeData.sections
      .filter(section => section.visible)
      .sort((a, b) => a.order - b.order);

    for (const section of visibleSections) {
      this.renderSection(section, resumeData);
    }

    return this.doc;
  }

  private renderSection(section: any, resumeData: ResumeData): void {
    switch (section.type) {
      case 'personalInfo':
        this.renderPersonalInfo(resumeData.personalInfo);
        break;
      case 'summary':
        if (resumeData.summary) {
          this.renderSummary(resumeData.summary);
        }
        break;
      case 'experience':
        if (resumeData.experience.length > 0) {
          this.renderExperience(resumeData.experience);
        }
        break;
      case 'education':
        if (resumeData.education.length > 0) {
          this.renderEducation(resumeData.education);
        }
        break;
      case 'skills':
        if (resumeData.skills.length > 0) {
          this.renderSkills(resumeData.skills);
        }
        break;
      case 'projects':
        if (resumeData.projects.length > 0) {
          this.renderProjects(resumeData.projects);
        }
        break;
      case 'certifications':
        if (resumeData.certifications.length > 0) {
          this.renderCertifications(resumeData.certifications);
        }
        break;
      case 'languages':
        if (resumeData.languages.length > 0) {
          this.renderLanguages(resumeData.languages);
        }
        break;
      case 'custom':
        const customSection = resumeData.customSections.find(cs => cs.id === section.id);
        if (customSection) {
          this.renderCustomSection(customSection);
        }
        break;
    }
  }

  private renderPersonalInfo(personalInfo: any): void {
    // Name
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(personalInfo.fullName, this.margin, this.yPosition);
    this.yPosition += 10;

    // Contact info
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const contactInfo = [
      personalInfo.email,
      personalInfo.phone,
      personalInfo.location,
      personalInfo.linkedin,
      personalInfo.github,
      personalInfo.portfolio
    ].filter(Boolean);

    this.doc.text(contactInfo.join(' | '), this.margin, this.yPosition);
    this.yPosition += 15;
  }

  private renderSummary(summary: string): void {
    this.renderSectionHeader('PROFESSIONAL SUMMARY');
    this.renderParagraph(summary);
    this.yPosition += 5;
  }

  private renderExperience(experience: any[]): void {
    this.renderSectionHeader('WORK EXPERIENCE');
    
    experience.forEach((exp, index) => {
      if (index > 0) this.yPosition += 5;
      
      // Company and position
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(exp.position, this.margin, this.yPosition);
      
      this.doc.setFont('helvetica', 'normal');
      const rightText = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;
      const textWidth = this.doc.getTextWidth(rightText);
      this.doc.text(rightText, 190 - textWidth, this.yPosition);
      this.yPosition += this.lineHeight;
      
      this.doc.setFontSize(10);
      this.doc.text(`${exp.company} | ${exp.location}`, this.margin, this.yPosition);
      this.yPosition += this.lineHeight + 2;
      
      // Description bullets
      exp.description.forEach((bullet: string) => {
        if (bullet.trim()) {
          this.renderBulletPoint(bullet);
        }
      });
    });
    this.yPosition += 5;
  }

  private renderEducation(education: any[]): void {
    this.renderSectionHeader('EDUCATION');
    
    education.forEach((edu, index) => {
      if (index > 0) this.yPosition += 5;
      
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(edu.degree, this.margin, this.yPosition);
      
      this.doc.setFont('helvetica', 'normal');
      const rightText = edu.graduationDate;
      const textWidth = this.doc.getTextWidth(rightText);
      this.doc.text(rightText, 190 - textWidth, this.yPosition);
      this.yPosition += this.lineHeight;
      
      this.doc.setFontSize(10);
      let schoolInfo = edu.institution;
      if (edu.gpa) schoolInfo += ` | GPA: ${edu.gpa}`;
      this.doc.text(schoolInfo, this.margin, this.yPosition);
      this.yPosition += this.lineHeight;
      
      if (edu.coursework && edu.coursework.length > 0) {
        this.doc.text(`Relevant Coursework: ${edu.coursework.join(', ')}`, this.margin, this.yPosition);
        this.yPosition += this.lineHeight;
      }
    });
    this.yPosition += 5;
  }

  private renderSkills(skills: any[]): void {
    this.renderSectionHeader('SKILLS');
    
    const skillsByCategory = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill.name);
      return acc;
    }, {});
    
    Object.entries(skillsByCategory).forEach(([category, skillList]) => {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${category}:`, this.margin, this.yPosition);
      
      this.doc.setFont('helvetica', 'normal');
      const skillText = (skillList as string[]).join(', ');
      const lines = this.doc.splitTextToSize(skillText, 150);
      this.doc.text(lines, this.margin + 25, this.yPosition);
      this.yPosition += lines.length * this.lineHeight + 2;
    });
    this.yPosition += 5;
  }

  private renderProjects(projects: any[]): void {
    this.renderSectionHeader('PROJECTS');
    
    projects.forEach((project, index) => {
      if (index > 0) this.yPosition += 5;
      
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(project.name, this.margin, this.yPosition);
      this.yPosition += this.lineHeight;
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.renderParagraph(project.description);
      
      if (project.technologies && project.technologies.length > 0) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Technologies: ', this.margin, this.yPosition);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(project.technologies.join(', '), this.margin + 25, this.yPosition);
        this.yPosition += this.lineHeight;
      }
      
      if (project.githubUrl || project.liveUrl) {
        const urls = [];
        if (project.githubUrl) urls.push(`GitHub: ${project.githubUrl}`);
        if (project.liveUrl) urls.push(`Live: ${project.liveUrl}`);
        this.doc.text(urls.join(' | '), this.margin, this.yPosition);
        this.yPosition += this.lineHeight;
      }
    });
    this.yPosition += 5;
  }

  private renderCertifications(certifications: any[]): void {
    this.renderSectionHeader('CERTIFICATIONS');
    
    certifications.forEach((cert, index) => {
      if (index > 0) this.yPosition += 3;
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(cert.name, this.margin, this.yPosition);
      
      this.doc.setFont('helvetica', 'normal');
      const rightText = cert.date;
      const textWidth = this.doc.getTextWidth(rightText);
      this.doc.text(rightText, 190 - textWidth, this.yPosition);
      this.yPosition += this.lineHeight;
      
      this.doc.text(cert.issuer, this.margin, this.yPosition);
      this.yPosition += this.lineHeight;
    });
    this.yPosition += 5;
  }

  private renderLanguages(languages: any[]): void {
    this.renderSectionHeader('LANGUAGES');
    
    const languageText = languages.map(lang => `${lang.name} (${lang.proficiency})`).join(', ');
    this.renderParagraph(languageText);
    this.yPosition += 5;
  }

  private renderCustomSection(section: any): void {
    this.renderSectionHeader(section.title.toUpperCase());
    
    if (section.type === 'text') {
      section.content.forEach((item: any) => {
        this.renderParagraph(item.text);
      });
    } else if (section.type === 'list') {
      section.content.forEach((item: any) => {
        this.renderBulletPoint(item.text);
      });
    }
    this.yPosition += 5;
  }

  private renderSectionHeader(title: string): void {
    this.checkPageBreak(15);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.yPosition);
    this.yPosition += 8;
    
    // Add line under header
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.yPosition, 190, this.yPosition);
    this.yPosition += 8;
  }

  private renderParagraph(text: string): void {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const lines = this.doc.splitTextToSize(text, 170);
    this.checkPageBreak(lines.length * this.lineHeight + 5);
    this.doc.text(lines, this.margin, this.yPosition);
    this.yPosition += lines.length * this.lineHeight + 2;
  }

  private renderBulletPoint(text: string): void {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const lines = this.doc.splitTextToSize(text, 165);
    this.checkPageBreak(lines.length * this.lineHeight + 2);
    
    // Add bullet
    this.doc.text('•', this.margin + 5, this.yPosition);
    this.doc.text(lines, this.margin + 10, this.yPosition);
    this.yPosition += lines.length * this.lineHeight + 1;
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.yPosition + requiredSpace > this.pageHeight) {
      this.doc.addPage();
      this.yPosition = 20;
    }
  }
}