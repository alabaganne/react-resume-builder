'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useResume } from './ResumeContext';
import { ResumeSection, CustomSection } from '@/lib/resume-types';
import { StorageManager } from '@/lib/storage';
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Settings,
} from 'lucide-react';

const sectionTemplates = [
  { id: 'publications', title: 'Publications', type: 'list' as const },
  { id: 'volunteer', title: 'Volunteer Work', type: 'structured' as const },
  { id: 'awards', title: 'Awards & Honors', type: 'list' as const },
  { id: 'interests', title: 'Interests', type: 'text' as const },
  { id: 'references', title: 'References', type: 'structured' as const },
];

export const SectionManager: React.FC = () => {
  const { currentResume, setCurrentResume } = useResume();
  const [showAddSection, setShowAddSection] = useState(false);
  const [customSectionTitle, setCustomSectionTitle] = useState('');
  const [customSectionType, setCustomSectionType] = useState<'text' | 'list' | 'structured'>('text');

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(currentResume.sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedSections = items.map((section, index) => ({
      ...section,
      order: index,
    }));

    setCurrentResume({
      ...currentResume,
      sections: updatedSections,
      updatedAt: new Date().toISOString(),
    });
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const updatedSections = currentResume.sections.map(section =>
      section.id === sectionId
        ? { ...section, visible: !section.visible }
        : section
    );

    setCurrentResume({
      ...currentResume,
      sections: updatedSections,
      updatedAt: new Date().toISOString(),
    });
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    
    const sections = [...currentResume.sections];
    [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
    
    const updatedSections = sections.map((section, idx) => ({
      ...section,
      order: idx,
    }));

    setCurrentResume({
      ...currentResume,
      sections: updatedSections,
      updatedAt: new Date().toISOString(),
    });
  };

  const moveSectionDown = (index: number) => {
    if (index === currentResume.sections.length - 1) return;
    
    const sections = [...currentResume.sections];
    [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    
    const updatedSections = sections.map((section, idx) => ({
      ...section,
      order: idx,
    }));

    setCurrentResume({
      ...currentResume,
      sections: updatedSections,
      updatedAt: new Date().toISOString(),
    });
  };

  const addCustomSection = (title?: string, type?: 'text' | 'list' | 'structured') => {
    const sectionTitle = title || customSectionTitle;
    const sectionType = type || customSectionType;
    
    if (!sectionTitle.trim()) return;

    const newSection: ResumeSection = {
      id: StorageManager.generateId(),
      type: 'custom',
      title: sectionTitle,
      visible: true,
      order: currentResume.sections.length,
    };

    const newCustomSection: CustomSection = {
      id: newSection.id,
      title: sectionTitle,
      type: sectionType,
      content: [],
      visible: true,
    };

    setCurrentResume({
      ...currentResume,
      sections: [...currentResume.sections, newSection],
      customSections: [...currentResume.customSections, newCustomSection],
      updatedAt: new Date().toISOString(),
    });

    setCustomSectionTitle('');
    setShowAddSection(false);
  };

  const removeCustomSection = (sectionId: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      const updatedSections = currentResume.sections.filter(section => section.id !== sectionId);
      const updatedCustomSections = currentResume.customSections.filter(section => section.id !== sectionId);

      setCurrentResume({
        ...currentResume,
        sections: updatedSections.map((section, index) => ({ ...section, order: index })),
        customSections: updatedCustomSections,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const getSectionCount = (section: ResumeSection) => {
    switch (section.type) {
      case 'experience':
        return currentResume.experience.length;
      case 'education':
        return currentResume.education.length;
      case 'skills':
        return currentResume.skills.length;
      case 'projects':
        return currentResume.projects.length;
      case 'certifications':
        return currentResume.certifications.length;
      case 'languages':
        return currentResume.languages.length;
      case 'custom':
        const customSection = currentResume.customSections.find(cs => cs.id === section.id);
        return customSection?.content.length || 0;
      default:
        return null;
    }
  };

  const sortedSections = [...currentResume.sections].sort((a, b) => a.order - b.order);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Section Manager
          </CardTitle>
          <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Section</DialogTitle>
                <DialogDescription>
                  Create a new section for your resume or choose from templates.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="section-title">Section Title</Label>
                  <Input
                    id="section-title"
                    value={customSectionTitle}
                    onChange={(e) => setCustomSectionTitle(e.target.value)}
                    placeholder="e.g., Publications, Awards, Volunteer Work"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="section-type">Section Type</Label>
                  <Select value={customSectionType} onValueChange={(value: any) => setCustomSectionType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Paragraph</SelectItem>
                      <SelectItem value="list">Bullet Points</SelectItem>
                      <SelectItem value="structured">Structured Items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Quick Templates</Label>
                  <div className="flex flex-wrap gap-2">
                    {sectionTemplates.map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        onClick={() => addCustomSection(template.title, template.type)}
                      >
                        {template.title}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddSection(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => addCustomSection()}
                    disabled={!customSectionTitle.trim()}
                  >
                    Add Section
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {sortedSections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center justify-between p-3 border rounded-lg bg-white transition-shadow ${
                          snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div {...provided.dragHandleProps}>
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                          </div>
                          
                          <Switch
                            checked={section.visible}
                            onCheckedChange={() => toggleSectionVisibility(section.id)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                          
                          <div className="flex items-center space-x-2">
                            {section.visible ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            )}
                            <span className={`font-medium ${!section.visible ? 'text-gray-400' : ''}`}>
                              {section.title}
                            </span>
                            {getSectionCount(section) !== null && (
                              <Badge variant="secondary" className="text-xs">
                                {getSectionCount(section)} items
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSectionUp(index)}
                            disabled={index === 0}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSectionDown(index)}
                            disabled={index === sortedSections.length - 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          
                          {section.type === 'custom' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCustomSection(section.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
};