import React, { useMemo } from 'react';
import ProfessionalResume from './ProfessionalResume';
import '../styles/CustomResumeDisplay.css';

function CustomResumeDisplay({ customResume }) {
  const parsedResumeData = useMemo(() => {
    try {
      if (!customResume) {
        console.log('No resume data provided');
        return null;
      }

      // Remove the initial text before the first section if it exists
      const cleanedResume = customResume.replace(/^.*?(?=\*\*Contact Information\*\*)/s, '');

      const sections = {
        contactInfo: {},
        professionalSummary: '',
        keySkills: [],
        professionalExperience: [],
        education: [],
        additionalInfo: {}
      };

      // Split the resume into sections using the ** markers
      const sectionBlocks = cleanedResume.split(/\*\*([^*]+)\*\*/);
      
      if (!sectionBlocks || sectionBlocks.length === 0) {
        console.warn('Unable to parse resume sections');
        return sections;
      }

      // Process sections in pairs (title and content)
      for (let i = 0; i < sectionBlocks.length; i += 2) {
        try {
          const sectionName = sectionBlocks[i]?.trim();
          const content = sectionBlocks[i + 1]?.trim() || '';

          if (!sectionName) continue;

          switch (sectionName) {
            case 'Contact Information':
              const contactLines = content.split('\n').filter(Boolean);
              sections.contactInfo = {
                name: contactLines[0] || '',
                email: contactLines.find(l => l.includes('@')) || '',
                phone: contactLines.find(l => /[\d-()]+/.test(l)) || '',
                location: contactLines.find(l => !l.includes('@') && !l.includes('http')) || ''
              };
              break;

            case 'Professional Summary':
              sections.professionalSummary = content;
              break;

            case 'Key Skills':
              sections.keySkills = content
                .split('\n')
                .filter(line => line.trim().startsWith('*'))
                .map(skill => skill.replace('*', '').trim())
                .filter(Boolean);
              break;

            case 'Professional Experience':
              const experiences = [];
              let currentExp = null;
              
              content.split('\n').forEach(line => {
                line = line.trim();
                if (!line) return;

                if (line.startsWith('**')) {
                  // New job entry
                  if (currentExp) experiences.push(currentExp);
                  
                  // Parse job title and company
                  const jobLine = line.replace(/\*\*/g, '');
                  const [title, companyInfo] = jobLine.split(',').map(s => s.trim());
                  const [company, dates] = (companyInfo || '').split('(').map(s => s.trim());
                  
                  currentExp = {
                    title: title || '',
                    company: company?.replace(/-.*$/, '').trim() || '',
                    dates: dates?.replace(')', '') || '',
                    achievements: []
                  };
                } else if (line.startsWith('*')) {
                  // Achievement bullet point
                  if (currentExp) {
                    currentExp.achievements.push(line.replace('*', '').trim());
                  }
                }
              });
              
              if (currentExp) experiences.push(currentExp);
              sections.professionalExperience = experiences;
              break;

            case 'Education':
              const eduLines = content.split('\n').filter(Boolean);
              sections.education = eduLines
                .filter(line => line.startsWith('*'))
                .map(edu => {
                  const [degree, yearInfo] = edu.replace('*', '').split('(');
                  return {
                    degree: degree?.trim() || '',
                    institution: '',
                    graduationYear: yearInfo?.replace(')', '').trim() || ''
                  };
                });
              break;

            case 'Additional Information':
              const additionalLines = content
                .split('\n')
                .filter(line => line.startsWith('*'))
                .map(line => line.replace('*', '').trim());
              
              sections.additionalInfo = {
                languages: additionalLines.filter(line => line.toLowerCase().includes('proficient')),
                certifications: additionalLines.filter(line => !line.toLowerCase().includes('proficient'))
              };
              break;
          }
        } catch (error) {
          console.error(`Error processing section ${sectionBlocks[i]}:`, error);
        }
      }

      console.log('Parsed Resume Data:', sections); // Debug log
      return sections;
    } catch (error) {
      console.error('Error parsing resume data:', error);
      return null;
    }
  }, [customResume]);

  if (!customResume) return null;

  return (
    <div className="custom-resume-container">
      <ProfessionalResume resumeData={parsedResumeData} />
    </div>
  );
}

export default CustomResumeDisplay;