'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ResumeData } from '@/lib/resume-types';
import { StorageManager } from '@/lib/storage';

interface ResumeContextType {
  currentResume: ResumeData;
  setCurrentResume: (resume: ResumeData) => void;
  savedResumes: ResumeData[];
  saveResume: () => void;
  createNewResume: () => void;
  loadResume: (id: string) => void;
  deleteResume: (id: string) => void;
  isAutoSaving: boolean;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

interface ResumeProviderProps {
  children: ReactNode;
}

export const ResumeProvider: React.FC<ResumeProviderProps> = ({ children }) => {
  const [currentResume, setCurrentResumeState] = useState<ResumeData>(StorageManager.createEmptyResume());
  const [savedResumes, setSavedResumes] = useState<ResumeData[]>([]);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  useEffect(() => {
    // Load saved resumes on mount
    const resumes = StorageManager.getAllResumes();
    setSavedResumes(resumes);
    
    // Load the most recent resume if available
    if (resumes.length > 0) {
      const mostRecent = resumes.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      setCurrentResumeState(mostRecent);
    }
  }, []);

  useEffect(() => {
    // Auto-save every 30 seconds
    const autoSaveInterval = setInterval(() => {
      if (currentResume.personalInfo.fullName || currentResume.summary) {
        saveResume();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [currentResume]);

  const setCurrentResume = (resume: ResumeData) => {
    setCurrentResumeState(resume);
  };

  const saveResume = async () => {
    setIsAutoSaving(true);
    try {
      StorageManager.saveResume(currentResume);
      const updatedResumes = StorageManager.getAllResumes();
      setSavedResumes(updatedResumes);
    } catch (error) {
      console.error('Failed to save resume:', error);
    } finally {
      setTimeout(() => setIsAutoSaving(false), 1000);
    }
  };

  const createNewResume = () => {
    const newResume = StorageManager.createEmptyResume();
    setCurrentResumeState(newResume);
  };

  const loadResume = (id: string) => {
    const resume = StorageManager.getResume(id);
    if (resume) {
      setCurrentResumeState(resume);
    }
  };

  const deleteResume = (id: string) => {
    StorageManager.deleteResume(id);
    const updatedResumes = StorageManager.getAllResumes();
    setSavedResumes(updatedResumes);
    
    if (currentResume.id === id) {
      if (updatedResumes.length > 0) {
        setCurrentResumeState(updatedResumes[0]);
      } else {
        createNewResume();
      }
    }
  };

  return (
    <ResumeContext.Provider
      value={{
        currentResume,
        setCurrentResume,
        savedResumes,
        saveResume,
        createNewResume,
        loadResume,
        deleteResume,
        isAutoSaving,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};