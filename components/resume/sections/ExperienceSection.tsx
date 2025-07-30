'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useResume } from '../ResumeContext';
import { WorkExperience } from '@/lib/resume-types';
import { StorageManager } from '@/lib/storage';
import { Briefcase, Plus, Trash2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export const ExperienceSection: React.FC = () => {
  const { currentResume, setCurrentResume } = useResume();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const addExperience = () => {
    const newExperience: WorkExperience = {
      id: StorageManager.generateId(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      location: '',
      description: [''],
    };

    setCurrentResume({
      ...currentResume,
      experience: [...currentResume.experience, newExperience],
      updatedAt: new Date().toISOString(),
    });

    setExpandedItems(prev => new Set(prev).add(newExperience.id));
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: any) => {
    const updatedExperience = currentResume.experience.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    );

    setCurrentResume({
      ...currentResume,
      experience: updatedExperience,
      updatedAt: new Date().toISOString(),
    });
  };

  const removeExperience = (id: string) => {
    if (confirm('Are you sure you want to remove this experience?')) {
      const updatedExperience = currentResume.experience.filter(exp => exp.id !== id);
      setCurrentResume({
        ...currentResume,
        experience: updatedExperience,
        updatedAt: new Date().toISOString(),
      });
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const addDescriptionBullet = (experienceId: string) => {
    updateExperience(experienceId, 'description', [
      ...currentResume.experience.find(exp => exp.id === experienceId)?.description || [],
      ''
    ]);
  };

  const updateDescriptionBullet = (experienceId: string, bulletIndex: number, value: string) => {
    const experience = currentResume.experience.find(exp => exp.id === experienceId);
    if (experience) {
      const updatedDescription = [...experience.description];
      updatedDescription[bulletIndex] = value;
      updateExperience(experienceId, 'description', updatedDescription);
    }
  };

  const removeDescriptionBullet = (experienceId: string, bulletIndex: number) => {
    const experience = currentResume.experience.find(exp => exp.id === experienceId);
    if (experience && experience.description.length > 1) {
      const updatedDescription = experience.description.filter((_, index) => index !== bulletIndex);
      updateExperience(experienceId, 'description', updatedDescription);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(currentResume.experience);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCurrentResume({
      ...currentResume,
      experience: items,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Work Experience
          </CardTitle>
          <Button onClick={addExperience}>
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {currentResume.experience.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No work experience added yet.</p>
            <p className="text-sm">Click "Add Experience" to get started.</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="experience">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {currentResume.experience.map((exp, index) => (
                    <Draggable key={exp.id} draggableId={exp.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border rounded-lg p-4 bg-white transition-shadow ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                              </div>
                              <h3 
                                className="font-semibold cursor-pointer hover:text-blue-600"
                                onClick={() => toggleExpanded(exp.id)}
                              >
                                {exp.position || 'New Position'} 
                                {exp.company && ` at ${exp.company}`}
                              </h3>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExperience(exp.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {(expandedItems.has(exp.id) || !exp.position) && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`position-${exp.id}`}>Position Title *</Label>
                                  <Input
                                    id={`position-${exp.id}`}
                                    value={exp.position}
                                    onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                    placeholder="Software Engineer"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor={`company-${exp.id}`}>Company *</Label>
                                  <Input
                                    id={`company-${exp.id}`}
                                    value={exp.company}
                                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                    placeholder="Tech Corp"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor={`startDate-${exp.id}`}>Start Date *</Label>
                                  <Input
                                    id={`startDate-${exp.id}`}
                                    type="month"
                                    value={exp.startDate}
                                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor={`endDate-${exp.id}`}>End Date</Label>
                                  <Input
                                    id={`endDate-${exp.id}`}
                                    type="month"
                                    value={exp.endDate}
                                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                    disabled={exp.current}
                                  />
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Checkbox
                                      id={`current-${exp.id}`}
                                      checked={exp.current}
                                      onCheckedChange={(checked) => {
                                        updateExperience(exp.id, 'current', checked);
                                        if (checked) {
                                          updateExperience(exp.id, 'endDate', '');
                                        }
                                      }}
                                    />
                                    <Label htmlFor={`current-${exp.id}`}>Currently working here</Label>
                                  </div>
                                </div>
                                
                                <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor={`location-${exp.id}`}>Location</Label>
                                  <Input
                                    id={`location-${exp.id}`}
                                    value={exp.location}
                                    onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                                    placeholder="City, State"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label>Job Description & Achievements</Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addDescriptionBullet(exp.id)}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Bullet
                                  </Button>
                                </div>
                                
                                {exp.description.map((bullet, bulletIndex) => (
                                  <div key={bulletIndex} className="flex gap-2">
                                    <Textarea
                                      value={bullet}
                                      onChange={(e) => updateDescriptionBullet(exp.id, bulletIndex, e.target.value)}
                                      placeholder="• Describe your responsibilities and achievements (use action verbs, include metrics when possible)"
                                      className="min-h-[60px] resize-none"
                                      rows={2}
                                    />
                                    {exp.description.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeDescriptionBullet(exp.id, bulletIndex)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {index < currentResume.experience.length - 1 && <Separator className="mt-4" />}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </CardContent>
    </Card>
  );
};