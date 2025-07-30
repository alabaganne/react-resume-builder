'use client';

import React, { useState } from 'react';
import { ResumeProvider } from '@/components/resume/ResumeContext';
import { ResumeHeader } from '@/components/resume/ResumeHeader';
import { SectionManager } from '@/components/resume/SectionManager';
import { PersonalInfoSection } from '@/components/resume/sections/PersonalInfoSection';
import { SummarySection } from '@/components/resume/sections/SummarySection';
import { ExperienceSection } from '@/components/resume/sections/ExperienceSection';
import { SkillsSection } from '@/components/resume/sections/SkillsSection';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/toaster';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { 
  FileText, 
  User, 
  Briefcase, 
  GraduationCap, 
  Zap, 
  FolderOpen, 
  Award, 
  Globe, 
  Settings, 
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X
} from 'lucide-react';

export default function Home() {
  const [showPreview, setShowPreview] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ResumeProvider>
      <div className="min-h-screen bg-gray-50">
        <ResumeHeader />
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Mobile Header with Menu Toggle */}
          <div className="flex items-center justify-between p-4 bg-white border-b">
            <h2 className="text-lg font-semibold">Resume Builder</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Preview
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
              <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Sections</h3>
                    <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-full pb-20">
                  <Tabs defaultValue="personal" className="w-full">
                    <div className="p-2">
                      <TabsList className="flex flex-col h-auto w-full space-y-1 bg-transparent p-0">
                        <TabsTrigger 
                          value="personal" 
                          className="w-full justify-start gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Personal Info
                        </TabsTrigger>
                        <TabsTrigger 
                          value="summary" 
                          className="w-full justify-start gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <FileText className="h-4 w-4" />
                          Summary
                        </TabsTrigger>
                        <TabsTrigger 
                          value="experience" 
                          className="w-full justify-start gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Briefcase className="h-4 w-4" />
                          Experience
                        </TabsTrigger>
                        <TabsTrigger 
                          value="education" 
                          className="w-full justify-start gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <GraduationCap className="h-4 w-4" />
                          Education
                        </TabsTrigger>
                        <TabsTrigger 
                          value="skills" 
                          className="w-full justify-start gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Zap className="h-4 w-4" />
                          Skills
                        </TabsTrigger>
                        <TabsTrigger 
                          value="projects" 
                          className="w-full justify-start gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <FolderOpen className="h-4 w-4" />
                          Projects
                        </TabsTrigger>
                        <TabsTrigger 
                          value="extras" 
                          className="w-full justify-start gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Award className="h-4 w-4" />
                          Extras
                        </TabsTrigger>
                        <TabsTrigger 
                          value="manage" 
                          className="w-full justify-start gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Manage
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </Tabs>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Mobile Content */}
          <div className="h-[calc(100vh-140px)]">
            {showPreview ? (
              <ScrollArea className="h-full">
                <div className="p-4">
                  <ResumePreview />
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-4">
                  <Tabs defaultValue="personal" className="space-y-6">
                    <TabsContent value="personal">
                      <PersonalInfoSection />
                    </TabsContent>
                    <TabsContent value="summary">
                      <SummarySection />
                    </TabsContent>
                    <TabsContent value="experience">
                      <ExperienceSection />
                    </TabsContent>
                    <TabsContent value="education">
                      <div className="text-center py-12 text-gray-500">
                        <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Education Section</h3>
                        <p>Education component will be implemented here.</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="skills">
                      <SkillsSection />
                    </TabsContent>
                    <TabsContent value="projects">
                      <div className="text-center py-12 text-gray-500">
                        <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Projects Section</h3>
                        <p>Projects component will be implemented here.</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="extras">
                      <div className="text-center py-12 text-gray-500">
                        <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Additional Sections</h3>
                        <p>Certifications, Languages, and other extras will be here.</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="manage">
                      <SectionManager />
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex h-[calc(100vh-80px)]">
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Left Sidebar */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
              <div className="h-full bg-white border-r">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900">Sections</h3>
                </div>
                <ScrollArea className="h-full pb-4">
                  <Tabs defaultValue="personal" orientation="vertical" className="w-full">
                    <TabsList className="flex flex-col h-auto w-full space-y-1 bg-transparent p-2">
                      <TabsTrigger 
                        value="personal" 
                        className="w-full justify-start gap-3 px-3 py-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                      >
                        <User className="h-4 w-4" />
                        Personal Info
                      </TabsTrigger>
                      <TabsTrigger 
                        value="summary" 
                        className="w-full justify-start gap-3 px-3 py-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                      >
                        <FileText className="h-4 w-4" />
                        Summary
                      </TabsTrigger>
                      <TabsTrigger 
                        value="experience" 
                        className="w-full justify-start gap-3 px-3 py-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                      >
                        <Briefcase className="h-4 w-4" />
                        Experience
                      </TabsTrigger>
                      <TabsTrigger 
                        value="education" 
                        className="w-full justify-start gap-3 px-3 py-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                      >
                        <GraduationCap className="h-4 w-4" />
                        Education
                      </TabsTrigger>
                      <TabsTrigger 
                        value="skills" 
                        className="w-full justify-start gap-3 px-3 py-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                      >
                        <Zap className="h-4 w-4" />
                        Skills
                      </TabsTrigger>
                      <TabsTrigger 
                        value="projects" 
                        className="w-full justify-start gap-3 px-3 py-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                      >
                        <FolderOpen className="h-4 w-4" />
                        Projects
                      </TabsTrigger>
                      <TabsTrigger 
                        value="extras" 
                        className="w-full justify-start gap-3 px-3 py-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                      >
                        <Award className="h-4 w-4" />
                        Extras
                      </TabsTrigger>
                      <TabsTrigger 
                        value="manage" 
                        className="w-full justify-start gap-3 px-3 py-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                      >
                        <Settings className="h-4 w-4" />
                        Manage
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Form Panel */}
            <ResizablePanel defaultSize={showPreview ? 40 : 80} minSize={30}>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 bg-white border-b">
                  <h2 className="text-lg font-semibold">Resume Builder</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? (
                      <>
                        <PanelLeftClose className="h-4 w-4 mr-2" />
                        Hide Preview
                      </>
                    ) : (
                      <>
                        <PanelLeftOpen className="h-4 w-4 mr-2" />
                        Show Preview
                      </>
                    )}
                  </Button>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-6">
                    <Tabs defaultValue="personal" className="space-y-6">
                      <TabsContent value="personal">
                        <PersonalInfoSection />
                      </TabsContent>

                      <TabsContent value="summary">
                        <SummarySection />
                      </TabsContent>

                      <TabsContent value="experience">
                        <ExperienceSection />
                      </TabsContent>

                      <TabsContent value="education">
                        <div className="text-center py-12 text-gray-500">
                          <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">Education Section</h3>
                          <p>Education component will be implemented here.</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="skills">
                        <SkillsSection />
                      </TabsContent>

                      <TabsContent value="projects">
                        <div className="text-center py-12 text-gray-500">
                          <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">Projects Section</h3>
                          <p>Projects component will be implemented here.</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="extras">
                        <div className="text-center py-12 text-gray-500">
                          <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">Additional Sections</h3>
                          <p>Certifications, Languages, and other extras will be here.</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="manage">
                        <SectionManager />
                      </TabsContent>
                    </Tabs>
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            {/* Preview Panel */}
            {showPreview && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40} minSize={30}>
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      <ResumePreview />
                    </div>
                  </ScrollArea>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
        
        <Toaster />
      </div>
    </ResumeProvider>
  );
}