'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useResume } from './ResumeContext';
import { PDFGenerator } from '@/lib/pdf-generator';
import { StorageManager } from '@/lib/storage';
import { PDFImporter } from './PDFImporter';
import {
  Save,
  Download,
  FileText,
  Plus,
  MoreVertical,
  Upload,
  Trash2,
  Copy,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export const ResumeHeader: React.FC = () => {
  const {
    currentResume,
    setCurrentResume,
    savedResumes,
    saveResume,
    createNewResume,
    loadResume,
    deleteResume,
    isAutoSaving,
  } = useResume();
  const { toast } = useToast();
  const [showResumes, setShowResumes] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState('');

  const handleTitleChange = (newTitle: string) => {
    setCurrentResume({
      ...currentResume,
      title: newTitle,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDownloadPDF = () => {
    try {
      const pdfGenerator = new PDFGenerator();
      const pdf = pdfGenerator.generateResumePDF(currentResume);
      pdf.save(`${currentResume.title || 'Resume'}.pdf`);
      
      toast({
        title: 'PDF Downloaded',
        description: 'Your resume has been downloaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'There was an error generating your PDF.',
        variant: 'destructive',
      });
    }
  };

  const handleExportJSON = () => {
    try {
      const jsonData = StorageManager.exportResume(currentResume);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentResume.title || 'Resume'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'JSON Exported',
        description: 'Your resume data has been exported successfully.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your resume data.',
        variant: 'destructive',
      });
    }
  };

  const handleImportJSON = () => {
    try {
      const importedResume = StorageManager.importResume(importData);
      setCurrentResume(importedResume);
      setImportDialogOpen(false);
      setImportData('');
      
      toast({
        title: 'Resume Imported',
        description: 'Your resume has been imported successfully.',
      });
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: 'Invalid JSON data. Please check your file and try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateResume = () => {
    const duplicated = {
      ...currentResume,
      id: StorageManager.generateId(),
      title: `${currentResume.title} - Copy`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentResume(duplicated);
    
    toast({
      title: 'Resume Duplicated',
      description: 'A copy of your resume has been created.',
    });
  };

  const handleDeleteResume = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteResume(id);
      toast({
        title: 'Resume Deleted',
        description: 'The resume has been deleted successfully.',
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <FileText className="h-6 w-6 text-blue-600 flex-shrink-0" />
        <Input
          value={currentResume.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="text-lg font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0 min-w-0"
          placeholder="Resume Title"
        />
        {isAutoSaving && (
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            <Clock className="h-3 w-3 mr-1" />
            Saving...
          </Badge>
        )}
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        {/* Mobile: Show only essential buttons */}
        <div className="lg:hidden flex items-center space-x-1">
          <PDFImporter />
          <Button onClick={handleDownloadPDF} size="sm">
            <Download className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={saveResume}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowResumes(true)}>
                <FileText className="h-4 w-4 mr-2" />
                My Resumes ({savedResumes.length})
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportJSON}>
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDuplicateResume}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Resume
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop: Show all buttons */}
        <div className="hidden lg:flex items-center space-x-2">
          <PDFImporter />
          
          <Button onClick={saveResume} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          <Dialog open={showResumes} onOpenChange={setShowResumes}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                My Resumes ({savedResumes.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>My Resumes</DialogTitle>
                <DialogDescription>
                  Manage your saved resumes, create new ones, or load existing ones.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <Card 
                  className="border-dashed border-2 hover:border-blue-400 cursor-pointer transition-colors"
                  onClick={() => {
                    createNewResume();
                    setShowResumes(false);
                  }}
                >
                  <CardContent className="flex flex-col items-center justify-center h-32">
                    <Plus className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Create New Resume</span>
                  </CardContent>
                </Card>

                {savedResumes.map((resume) => (
                  <Card
                    key={resume.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      resume.id === currentResume.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 
                          className="font-semibold text-sm truncate flex-1"
                          onClick={() => {
                            loadResume(resume.id);
                            setShowResumes(false);
                          }}
                        >
                          {resume.title}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem 
                              onClick={() => {
                                loadResume(resume.id);
                                setShowResumes(false);
                              }}
                            >
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const duplicated = {
                                ...resume,
                                id: StorageManager.generateId(),
                                title: `${resume.title} - Copy`,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                              };
                              setCurrentResume(duplicated);
                              setShowResumes(false);
                            }}>
                              <Copy className="h-3 w-3 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteResume(resume.id, resume.title)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-1">
                        {resume.personalInfo.fullName || 'Untitled'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Updated {format(new Date(resume.updatedAt), 'MMM d, yyyy')}
                      </p>
                      
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {resume.template}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleDownloadPDF} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportJSON}>
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDuplicateResume}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Resume
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Resume Data</DialogTitle>
            <DialogDescription>
              Paste your exported JSON data below to import a resume.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="w-full h-32 p-3 border rounded-md font-mono text-sm"
              placeholder="Paste your JSON data here..."
            />
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImportJSON} disabled={!importData.trim()}>
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};