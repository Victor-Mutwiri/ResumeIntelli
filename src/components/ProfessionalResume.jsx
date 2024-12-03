import React from 'react';
import { FaEnvelope, FaGithub, FaLinkedin } from 'react-icons/fa';

const ProfessionalResume = ({ resumeData }) => {
  if (!resumeData) return null;

  const {
    contactInfo,
    professionalSummary,
    keySkills,
    professionalExperience,
    education,
    additionalInfo
  } = resumeData;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
      {/* Header/Contact Section */}
      <div className="border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {contactInfo?.name}
        </h1>
        <div className="flex flex-wrap gap-4 text-gray-600">
          {contactInfo?.email && (
            <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2 hover:text-blue-600">
              <FaEnvelope className="text-blue-600" />
              {contactInfo.email}
            </a>
          )}
          {contactInfo?.github && (
            <a href={contactInfo.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600">
              <FaGithub className="text-blue-600" />
              GitHub
            </a>
          )}
          {contactInfo?.linkedin && (
            <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600">
              <FaLinkedin className="text-blue-600" />
              LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {professionalSummary && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {professionalSummary}
          </p>
        </div>
      )}

      {/* Key Skills */}
      {keySkills?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
            Key Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {keySkills.map((skill, index) => (
              <span 
                key={index}
                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Professional Experience */}
      {professionalExperience?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
            Professional Experience
          </h2>
          {professionalExperience.map((job, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
                  <p className="text-gray-600">{job.company}</p>
                </div>
                <span className="text-gray-500 text-sm">{job.dates}</span>
              </div>
              {job.achievements?.length > 0 && (
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {job.achievements.map((achievement, idx) => (
                    <li key={idx} className="text-sm">
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
            Education
          </h2>
          {education.map((edu, index) => (
            <div key={index} className="mb-2">
              <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
              <p className="text-gray-600">
                {edu.institution} {edu.graduationYear && `(${edu.graduationYear})`}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Additional Information */}
      {(additionalInfo?.languages?.length > 0 || additionalInfo?.certifications?.length > 0) && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
            Additional Information
          </h2>
          {additionalInfo.languages?.length > 0 && (
            <div className="mb-3">
              <h3 className="font-semibold text-gray-700 mb-1">Languages</h3>
              <ul className="list-disc list-inside text-gray-600">
                {additionalInfo.languages.map((lang, index) => (
                  <li key={index}>{lang}</li>
                ))}
              </ul>
            </div>
          )}
          {additionalInfo.certifications?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Certifications</h3>
              <ul className="list-disc list-inside text-gray-600">
                {additionalInfo.certifications.map((cert, index) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfessionalResume;