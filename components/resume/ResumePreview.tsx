'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useResume } from './ResumeContext';
import { Eye } from 'lucide-react';

export const ResumePreview: React.FC = () => {
  const { currentResume } = useResume();

  const visibleSections = currentResume.sections
    .filter(section => section.visible)
    .sort((a, b) => a.order - b.order);

  const renderPersonalInfo = () => (
    <div className="text-center border-b pb-6 mb-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
        {currentResume.personalInfo.fullName || 'Your Name'}
      </h1>
      <div className="flex flex-wrap justify-center gap-2 text-xs lg:text-sm text-gray-600">
        {currentResume.personalInfo.email && (
          <span>{currentResume.personalInfo.email}</span>
        )}
        {currentResume.personalInfo.phone && (
          <>
            <span>•</span>
            <span>{currentResume.personalInfo.phone}</span>
          </>
        )}
        {currentResume.personalInfo.location && (
          <>
            <span>•</span>
            <span>{currentResume.personalInfo.location}</span>
          </>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-4 text-xs lg:text-sm text-blue-600 mt-2">
        {currentResume.personalInfo.linkedin && (
          <span className="break-all">{currentResume.personalInfo.linkedin}</span>
        )}
        {currentResume.personalInfo.github && (
          <span className="break-all">{currentResume.personalInfo.github}</span>
        )}
        {currentResume.personalInfo.portfolio && (
          <span className="break-all">{currentResume.personalInfo.portfolio}</span>
        )}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="mb-6">
      <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 border-b pb-1">
        PROFESSIONAL SUMMARY
      </h2>
      <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
        {currentResume.summary || 'Your professional summary will appear here...'}
      </p>
    </div>
  );

  const renderExperience = () => (
    <div className="mb-6">
      <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 border-b pb-1">
        WORK EXPERIENCE
      </h2>
      {currentResume.experience.length === 0 ? (
        <p className="text-gray-500 italic text-sm lg:text-base">No work experience added yet.</p>
      ) : (
        <div className="space-y-4">
          {currentResume.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-1">
                <h3 className="font-bold text-gray-900 text-sm lg:text-base">{exp.position}</h3>
                <span className="text-xs lg:text-sm text-gray-600">
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              <div className="text-xs lg:text-sm text-gray-700 mb-2">
                {exp.company} | {exp.location}
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {exp.description.map((bullet, index) => (
                  bullet.trim() && (
                    <li key={index} className="text-xs lg:text-sm">
                      {bullet}
                    </li>
                  )
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEducation = () => (
    <div className="mb-6">
      <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 border-b pb-1">
        EDUCATION
      </h2>
      {currentResume.education.length === 0 ? (
        <p className="text-gray-500 italic text-sm lg:text-base">No education added yet.</p>
      ) : (
        <div className="space-y-3">
          {currentResume.education.map((edu) => (
            <div key={edu.id}>
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
                <h3 className="font-bold text-gray-900 text-sm lg:text-base">{edu.degree}</h3>
                <span className="text-xs lg:text-sm text-gray-600">{edu.graduationDate}</span>
              </div>
              <div className="text-xs lg:text-sm text-gray-700">
                {edu.institution}
                {edu.gpa && ` | GPA: ${edu.gpa}`}
              </div>
              {edu.coursework && edu.coursework.length > 0 && (
                <div className="text-xs lg:text-sm text-gray-600 mt-1">
                  <strong>Relevant Coursework:</strong> {edu.coursework.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSkills = () => {
    const groupedSkills = currentResume.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill.name);
      return acc;
    }, {} as Record<string, string[]>);

    return (
      <div className="mb-6">
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 border-b pb-1">
          SKILLS
        </h2>
        {Object.keys(groupedSkills).length === 0 ? (
          <p className="text-gray-500 italic text-sm lg:text-base">No skills added yet.</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(groupedSkills).map(([category, skills]) => (
              <div key={category}>
                <span className="font-semibold text-gray-900 text-sm lg:text-base">{category}:</span>{' '}
                <span className="text-gray-700 text-sm lg:text-base">{skills.join(', ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderProjects = () => (
    <div className="mb-6">
      <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 border-b pb-1">
        PROJECTS
      </h2>
      {currentResume.projects.length === 0 ? (
        <p className="text-gray-500 italic text-sm lg:text-base">No projects added yet.</p>
      ) : (
        <div className="space-y-4">
          {currentResume.projects.map((project) => (
            <div key={project.id}>
              <h3 className="font-bold text-gray-900 text-sm lg:text-base">{project.name}</h3>
              <p className="text-xs lg:text-sm text-gray-700 mb-2">{project.description}</p>
              {project.technologies.length > 0 && (
                <div className="text-xs lg:text-sm text-gray-600 mb-1">
                  <strong>Technologies:</strong> {project.technologies.join(', ')}
                </div>
              )}
              <div className="text-xs lg:text-sm text-blue-600">
                {project.githubUrl && <span className="break-all">{project.githubUrl}</span>}
                {project.liveUrl && (
                  <>
                    {project.githubUrl && ' | '}
                    <span className="break-all">{project.liveUrl}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCertifications = () => (
    <div className="mb-6">
      <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 border-b pb-1">
        CERTIFICATIONS
      </h2>
      {currentResume.certifications.length === 0 ? (
        <p className="text-gray-500 italic text-sm lg:text-base">No certifications added yet.</p>
      ) : (
        <div className="space-y-2">
          {currentResume.certifications.map((cert) => (
            <div key={cert.id}>
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
                <h3 className="font-bold text-gray-900 text-sm lg:text-base">{cert.name}</h3>
                <span className="text-xs lg:text-sm text-gray-600">{cert.date}</span>
              </div>
              <div className="text-xs lg:text-sm text-gray-700">{cert.issuer}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLanguages = () => (
    <div className="mb-6">
      <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 border-b pb-1">
        LANGUAGES
      </h2>
      {currentResume.languages.length === 0 ? (
        <p className="text-gray-500 italic text-sm lg:text-base">No languages added yet.</p>
      ) : (
        <div className="text-gray-700 text-sm lg:text-base">
          {currentResume.languages.map(lang => `${lang.name} (${lang.proficiency})`).join(', ')}
        </div>
      )}
    </div>
  );

  const renderCustomSection = (section: any) => {
    const customSection = currentResume.customSections.find(cs => cs.id === section.id);
    if (!customSection) return null;

    return (
      <div className="mb-6" key={section.id}>
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 border-b pb-1">
          {customSection.title.toUpperCase()}
        </h2>
        {customSection.content.length === 0 ? (
          <p className="text-gray-500 italic text-sm lg:text-base">No content added yet.</p>
        ) : (
          <div className="space-y-2">
            {customSection.content.map((item: any, index: number) => (
              <div key={index} className="text-gray-700 text-sm lg:text-base">
                {customSection.type === 'list' ? (
                  <li className="ml-4">{item.text}</li>
                ) : (
                  <p>{item.text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSection = (section: any) => {
    switch (section.type) {
      case 'personalInfo':
        return renderPersonalInfo();
      case 'summary':
        return renderSummary();
      case 'experience':
        return renderExperience();
      case 'education':
        return renderEducation();
      case 'skills':
        return renderSkills();
      case 'projects':
        return renderProjects();
      case 'certifications':
        return renderCertifications();
      case 'languages':
        return renderLanguages();
      case 'custom':
        return renderCustomSection(section);
      default:
        return null;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
          <Eye className="h-4 w-4 lg:h-5 lg:w-5" />
          Resume Preview
          <Badge variant="secondary" className="ml-auto text-xs">
            {currentResume.template}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-6">
        <div className="bg-white border rounded-lg p-4 lg:p-8 max-w-4xl mx-auto min-h-[600px] lg:min-h-[800px] shadow-sm">
          {visibleSections.map((section) => (
            <div key={section.id}>{renderSection(section)}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};