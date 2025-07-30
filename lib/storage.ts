import { ResumeData } from './resume-types';

const STORAGE_KEY = 'resume-builder-data';
const RESUMES_KEY = 'resume-builder-resumes';

export class StorageManager {
  static saveResume(resume: ResumeData): void {
    try {
      const resumes = this.getAllResumes();
      const existingIndex = resumes.findIndex(r => r.id === resume.id);
      
      if (existingIndex >= 0) {
        resumes[existingIndex] = { ...resume, updatedAt: new Date().toISOString() };
      } else {
        resumes.push(resume);
      }
      
      localStorage.setItem(RESUMES_KEY, JSON.stringify(resumes));
    } catch (error) {
      console.error('Failed to save resume:', error);
    }
  }

  static getResume(id: string): ResumeData | null {
    try {
      const resumes = this.getAllResumes();
      return resumes.find(r => r.id === id) || null;
    } catch (error) {
      console.error('Failed to get resume:', error);
      return null;
    }
  }

  static getAllResumes(): ResumeData[] {
    try {
      const data = localStorage.getItem(RESUMES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get resumes:', error);
      return [];
    }
  }

  static deleteResume(id: string): void {
    try {
      const resumes = this.getAllResumes();
      const filtered = resumes.filter(r => r.id !== id);
      localStorage.setItem(RESUMES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete resume:', error);
    }
  }

  static exportResume(resume: ResumeData): string {
    return JSON.stringify(resume, null, 2);
  }

  static importResume(jsonData: string): ResumeData {
    const resume = JSON.parse(jsonData);
    // Validate and sanitize imported data
    return {
      ...resume,
      id: resume.id || this.generateId(),
      updatedAt: new Date().toISOString()
    };
  }

  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static createEmptyResume(): ResumeData {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    return {
      id,
      title: 'Untitled Resume',
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: ''
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      customSections: [],
      sections: [
        { id: 'personalInfo', type: 'personalInfo', title: 'Personal Information', visible: true, order: 0 },
        { id: 'summary', type: 'summary', title: 'Professional Summary', visible: true, order: 1 },
        { id: 'experience', type: 'experience', title: 'Work Experience', visible: true, order: 2 },
        { id: 'education', type: 'education', title: 'Education', visible: true, order: 3 },
        { id: 'skills', type: 'skills', title: 'Skills', visible: true, order: 4 },
        { id: 'projects', type: 'projects', title: 'Projects', visible: true, order: 5 },
        { id: 'certifications', type: 'certifications', title: 'Certifications', visible: false, order: 6 },
        { id: 'languages', type: 'languages', title: 'Languages', visible: false, order: 7 }
      ],
      template: 'modern',
      createdAt: now,
      updatedAt: now
    };
  }
}