'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useResume } from '../ResumeContext';
import { FileText } from 'lucide-react';

export const SummarySection: React.FC = () => {
  const { currentResume, setCurrentResume } = useResume();

  const updateSummary = (value: string) => {
    setCurrentResume({
      ...currentResume,
      summary: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const wordCount = currentResume.summary.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isOptimalLength = wordCount >= 50 && wordCount <= 150;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Professional Summary
          </CardTitle>
          <Badge variant={isOptimalLength ? "default" : "secondary"}>
            {wordCount} words
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="summary">
            Summary
            <span className="text-sm text-gray-500 ml-2">
              (50-150 words recommended)
            </span>
          </Label>
          <Textarea
            id="summary"
            value={currentResume.summary}
            onChange={(e) => updateSummary(e.target.value)}
            placeholder="Write a compelling professional summary that highlights your key qualifications, experience, and career objectives. Focus on what makes you unique and valuable to potential employers."
            className="min-h-[120px] resize-none"
            rows={6}
          />
        </div>
        
        <div className="text-sm text-gray-600">
          <p className="mb-2"><strong>Tips for a great summary:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Start with your years of experience and key expertise</li>
            <li>Include specific skills and achievements</li>
            <li>Mention the type of role you're seeking</li>
            <li>Use keywords from your target job descriptions</li>
            <li>Keep it concise and impactful</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};