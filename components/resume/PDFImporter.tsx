'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PDFParser } from '@/lib/pdf-parser';
import { useResume } from './ResumeContext';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PDFImporter: React.FC = () => {
  const { setCurrentResume } = useResume();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.includes('pdf')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a PDF file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: 'File Too Large',
        description: 'Please select a PDF file smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const resumeData = await PDFParser.parseResumePDF(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Small delay to show completion
      setTimeout(() => {
        setCurrentResume(resumeData);
        setIsOpen(false);
        setIsUploading(false);
        setUploadProgress(0);
        
        toast({
          title: 'PDF Imported Successfully',
          description: 'Your resume has been automatically filled with data from the PDF.',
        });
      }, 500);

    } catch (error) {
      console.error('PDF import error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to parse PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import from PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Resume from PDF</DialogTitle>
          <DialogDescription>
            Upload your existing resume PDF and we'll automatically extract and fill in your information.
          </DialogDescription>
        </DialogHeader>

        {!isUploading ? (
          <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
            <CardContent 
              className={`p-8 text-center cursor-pointer ${dragActive ? 'bg-blue-50 border-blue-400' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">
                {dragActive ? 'Drop your PDF here' : 'Upload Resume PDF'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop your PDF file here, or click to browse
              </p>
              <Button variant="outline" size="sm">
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  {uploadProgress < 100 ? (
                    <FileText className="h-12 w-12 text-blue-600 animate-pulse" />
                  ) : (
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {uploadProgress < 100 ? 'Processing PDF...' : 'Import Complete!'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {uploadProgress < 100 
                      ? 'Extracting and parsing your resume data'
                      : 'Your resume has been successfully imported'
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-gray-500">{uploadProgress}% complete</p>
                </div>

                {uploadProgress < 100 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsUploading(false);
                      setUploadProgress(0);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Supported formats:</strong> PDF files up to 10MB. 
            The AI will do its best to extract information, but you may need to review and adjust the imported data.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
};