import React from 'react';
import { 
  User, 
  MapPin, 
  Mail, 
  Linkedin, 
  Github, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Languages 
} from 'lucide-react';


const ProfessionalResume = ({ resumeData }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Contact Information */}
      <section className="mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <User className="mr-3 text-blue-600" />
          {resumeData.contactInfo.name}
        </h1>
        <div className="flex flex-wrap gap-4 mt-2 text-gray-600">
          {resumeData.contactInfo.email && (
            <div className="flex items-center">
              <Mail className="mr-2 text-blue-500 w-4 h-4" />
              <a href={`mailto:${resumeData.contactInfo.email}`} className="hover:underline">
                {resumeData.contactInfo.email}
              </a>
            </div>
          )}
          {resumeData.contactInfo.location && (
            <div className="flex items-center">
              <MapPin className="mr-2 text-blue-500 w-4 h-4" />
              {resumeData.contactInfo.location}
            </div>
          )}
          {resumeData.contactInfo.linkedin && (
            <div className="flex items-center">
              <Linkedin className="mr-2 text-blue-500 w-4 h-4" />
              <a 
                href={resumeData.contactInfo.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline"
              >
                LinkedIn
              </a>
            </div>
          )}
          {resumeData.contactInfo.github && (
            <div className="flex items-center">
              <Github className="mr-2 text-blue-500 w-4 h-4" />
              <a 
                href={resumeData.contactInfo.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline"
              >
                GitHub
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Professional Summary */}
      {resumeData.professionalSummary && (
        <section className="mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2 flex items-center">
            <Briefcase className="mr-3 text-blue-600" />
            Professional Summary
          </h2>
          <p className="text-gray-600">{resumeData.professionalSummary}</p>
        </section>
      )}

      {/* Key Skills */}
      {resumeData.keySkills.length > 0 && (
        <section className="mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Key Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.keySkills.map((skill, index) => (
              <span 
                key={index} 
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Professional Experience */}
      {resumeData.professionalExperience?.length > 0 && (
        <section className="mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2 flex items-center">
            <Briefcase className="mr-3 text-blue-600" />
            Professional Experience
          </h2>
          {resumeData.professionalExperience.map((job, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  {job.title} | {job.company}
                </h3>
                <span className="text-gray-600 text-sm">{job.dates}</span>
              </div>
              {job.achievements.length > 0 && (
                <ul className="list-disc list-inside text-gray-600 pl-2 mt-1">
                  {job.achievements.map((achievement, achieveIndex) => (
                    <li key={achieveIndex} className="mb-1">
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {resumeData.education.length > 0 && (
        <section className="mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2 flex items-center">
            <GraduationCap className="mr-3 text-blue-600" />
            Education
          </h2>
          {resumeData.education.map((edu, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  {edu.institution}
                </h3>
                {edu.graduationYear && (
                  <span className="text-gray-600 text-sm">
                    {edu.graduationYear}
                  </span>
                )}
              </div>
              {edu.degree && (
                <p className="text-gray-600">{edu.degree}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Additional Information */}
      {((resumeData.additionalInfo?.languages && resumeData.additionalInfo.languages.length > 0) || 
        (resumeData.additionalInfo?.certifications && resumeData.additionalInfo.certifications.length > 0)) && (
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-2 flex items-center">
            <Award className="mr-3 text-blue-600" />
            Additional Information
          </h2>
          
          {resumeData.additionalInfo?.languages && resumeData.additionalInfo.languages.length > 0 && (
            <div className="mb-2">
              <h3 className="flex items-center text-md font-medium text-gray-700">
                <Languages className="mr-2 text-blue-500 w-4 h-4" />
                Languages
              </h3>
              <ul className="list-disc list-inside text-gray-600 pl-2">
                {resumeData.additionalInfo.languages.map((lang, index) => (
                  <li key={index}>{lang}</li>
                ))}
              </ul>
            </div>
          )}
          
          {resumeData.additionalInfo?.certifications && resumeData.additionalInfo.certifications.length > 0 && (
            <div>
              <h3 className="flex items-center text-md font-medium text-gray-700">
                <Award className="mr-2 text-blue-500 w-4 h-4" />
                Certifications
              </h3>
              <ul className="list-disc list-inside text-gray-600 pl-2">
                {resumeData.additionalInfo.certifications.map((cert, index) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ProfessionalResume;