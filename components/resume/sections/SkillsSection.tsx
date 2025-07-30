'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useResume } from '../ResumeContext';
import { Skill } from '@/lib/resume-types';
import { StorageManager } from '@/lib/storage';
import { Zap, Plus, X } from 'lucide-react';

const skillCategories = [
  'Technical Skills',
  'Programming Languages',
  'Frameworks & Libraries',
  'Tools & Software',
  'Databases',
  'Cloud Platforms',
  'Soft Skills',
  'Languages',
  'Certifications',
  'Other'
];

const suggestedSkills = {
  'Technical Skills': ['HTML', 'CSS', 'JavaScript', 'Python', 'Java', 'C++', 'SQL', 'Git'],
  'Programming Languages': ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Go', 'Rust', 'PHP'],
  'Frameworks & Libraries': ['React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring'],
  'Tools & Software': ['VS Code', 'Docker', 'Kubernetes', 'Jira', 'Figma', 'Adobe Creative Suite'],
  'Databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'Oracle'],
  'Cloud Platforms': ['AWS', 'Google Cloud', 'Azure', 'Heroku', 'Vercel', 'Netlify'],
  'Soft Skills': ['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration', 'Project Management'],
};

export const SkillsSection: React.FC = () => {
  const { currentResume, setCurrentResume } = useResume();
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Technical Skills');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');

  const addSkill = () => {
    if (!newSkillName.trim()) return;

    const newSkill: Skill = {
      id: StorageManager.generateId(),
      name: newSkillName.trim(),
      category: newSkillCategory,
      level: newSkillLevel,
    };

    setCurrentResume({
      ...currentResume,
      skills: [...currentResume.skills, newSkill],
      updatedAt: new Date().toISOString(),
    });

    setNewSkillName('');
  };

  const addSuggestedSkill = (skillName: string, category: string) => {
    if (currentResume.skills.some(skill => skill.name.toLowerCase() === skillName.toLowerCase())) {
      return; // Skill already exists
    }

    const newSkill: Skill = {
      id: StorageManager.generateId(),
      name: skillName,
      category: category,
      level: 'Intermediate',
    };

    setCurrentResume({
      ...currentResume,
      skills: [...currentResume.skills, newSkill],
      updatedAt: new Date().toISOString(),
    });
  };

  const removeSkill = (id: string) => {
    const updatedSkills = currentResume.skills.filter(skill => skill.id !== id);
    setCurrentResume({
      ...currentResume,
      skills: updatedSkills,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateSkillLevel = (id: string, level: string) => {
    const updatedSkills = currentResume.skills.map(skill =>
      skill.id === id ? { ...skill, level: level as any } : skill
    );

    setCurrentResume({
      ...currentResume,
      skills: updatedSkills,
      updatedAt: new Date().toISOString(),
    });
  };

  const groupedSkills = currentResume.skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const getSkillBadgeVariant = (level?: string) => {
    switch (level) {
      case 'Expert': return 'default';
      case 'Advanced': return 'secondary';
      case 'Intermediate': return 'outline';
      case 'Beginner': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Skills
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Skill */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-semibold">Add New Skill</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Skill Name</Label>
              <Input
                id="skill-name"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g., React"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="skill-category">Category</Label>
              <Select value={newSkillCategory} onValueChange={setNewSkillCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="skill-level">Proficiency</Label>
              <Select value={newSkillLevel} onValueChange={(value: any) => setNewSkillLevel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={addSkill} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </div>
          </div>
        </div>

        {/* Skill Suggestions */}
        <div className="space-y-4">
          <h4 className="font-semibold">Quick Add Suggestions</h4>
          {Object.entries(suggestedSkills).map(([category, skills]) => (
            <div key={category} className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700">{category}</h5>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Button
                    key={skill}
                    variant="outline"
                    size="sm"
                    onClick={() => addSuggestedSkill(skill, category)}
                    disabled={currentResume.skills.some(s => s.name.toLowerCase() === skill.toLowerCase())}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {skill}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Current Skills */}
        {Object.keys(groupedSkills).length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-semibold">Your Skills ({currentResume.skills.length})</h4>
            {Object.entries(groupedSkills).map(([category, skills]) => (
              <div key={category} className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">{category}</h5>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant={getSkillBadgeVariant(skill.level)}
                      className="text-sm px-3 py-1 group cursor-pointer"
                    >
                      <span className="mr-2">{skill.name}</span>
                      {skill.level && (
                        <span className="text-xs opacity-75">({skill.level})</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(skill.id)}
                        className="ml-2 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No skills added yet.</p>
            <p className="text-sm">Add your skills to showcase your expertise.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};