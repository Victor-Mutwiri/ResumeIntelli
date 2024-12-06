// App.js
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedinIn, faGithub} from '@fortawesome/free-brands-svg-icons';
import FileUpload from '../components/FileUpload';
import ActionButtons from '../components/ActionButtons';
import FeedbackDisplay from '../components/FeedbackDisplay';
import CustomResumeDisplay from '../components/CustomResumeDisplay';
import CoverLetterDisplay from '../components/CoverLetterDisplay';
import UserDetailsModal from '../components/UserDetailsModal';
import './home.css'

/* const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; */
const API_BASE_URL = 'http://127.0.0.1:5000';

function Home() {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [feedback, setFeedback] = useState('');
  const [customResume, setCustomResume] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [pendingResume, setPendingResume] = useState(false);

  const handleResumeChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  };

  const handleAnalyze = async () => {
    if (!resume || !jobDescription) {
      alert('Please provide both a resume and a job description.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Feedback:', data.feedback);
        const formattedFeedback = formatFeedback(data.feedback);
        setFeedback(formattedFeedback);
      } else {
        alert(data.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while analyzing the resume.');
    }
  };

  const handleGenerateCustomResume = async () => {
    if (!resume || !jobDescription) {
      alert('Please provide both a resume and a job description.');
      return;
    }

    // Show the modal to collect user details
    setShowUserDetailsModal(true);
    setPendingResume(true);
  };

  const handleUserDetailsSubmit = async (details) => {
    setUserDetails(details);
    setShowUserDetailsModal(false);
    
    // Now proceed with generating the resume
    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jobDescription', jobDescription);
    formData.append('userDetails', JSON.stringify(details));

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate_custom_resume`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Custom Resume:', data.custom_resume);
        const formattedCustomResume = formatCustomResume(data.custom_resume, details);
        setCustomResume(formattedCustomResume);
      } else {
        alert(data.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while generating the custom resume.');
    }
    setPendingResume(false);
  };


  const handleGenerateCoverLetter = async () => {
    if (!resume || !jobDescription) {
      alert('Please provide both a resume and a job description.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate_cover_letter`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setCoverLetter(data.cover_letter);
      } else {
        alert(data.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while generating the cover letter.');
    }
  };

  const formatFeedback = (feedback) => {
    const sections = feedback.split('**').filter((section) => section.trim() !== '');
    const formattedSections = sections.map((section, index) => {
      if (index % 2 === 0) {
        // This is a heading
        return `<h3>${section.trim()}</h3>`;
      } else {
        // Process the content: split by asterisk and create list items
        const points = section.split('*').filter(point => point.trim());
        const formattedPoints = points.map(point => {
          return `<li>${point.trim()}</li>`;
        }).join('');
        
        return formattedPoints ? `<ul>${formattedPoints}</ul>` : `<p>${section.trim()}</p>`;
      }
    });
    return formattedSections.join('');
  };

  function formatCustomResume(customResume, details) {
    if (!customResume) return '';

    const headerSection = `
      <div class="resume-header">
        <h1>${details.name}</h1>
        <div class="contact-info">
          <p>${details.email} | ${details.phone} | ${details.location}</p>
          ${details.linkedin ? `<p><FontAwesomeIcon icon={faLinkedinIn} /><a href="${details.linkedin}" target="_blank">LinkedIn</a></p>` : ''}
          ${details.github ? `<p><FontAwesomeIcon icon={faGithub} /><a href="${details.github}" target="_blank">GitHub</a></p>` : ''}
          ${details.portfolio ? `<p><a href="${details.portfolio}" target="_blank">Portfolio</a></p>` : ''}
        </div>
      </div>
    `;
  
    const sections = customResume.split('\n\n').filter(section => section.trim() !== '');
    const formattedSections = sections.map(section => {
      const lines = section.split('\n').filter(line => line.trim() !== '');
      const firstLine = lines[0].trim();
  
      if (firstLine.toUpperCase() === firstLine) {
        // This is a section heading
        return `<h2>${firstLine}</h2>${lines.slice(1).map(line => `<p>${line.trim()}</p>`).join('')}`;
      } else if (firstLine.startsWith('•')) {
        // This is a list of skills or achievements
        return `<ul>${lines.map(line => `<li>${line.replace('•', '', '+').trim()}</li>`).join('')}</ul>`;
      } else if (firstLine.includes('**')) {
        // This is a work experience entry
        const [companyAndTitle, dates] = firstLine.split('_');
        const [company, title] = companyAndTitle.split('**').map(s => s.trim());
        const achievements = lines.slice(1).map(line => `<li>${line.replace('•', '', '+').trim()}</li>`).join('');
        return `<div><h3>${company} | ${title} | <em>${dates}</em></h3><ul>${achievements}</ul></div>`;
      } else if (firstLine.includes(':')) {
        // Handle sections with colons (e.g., SUMMARY:)
        const [heading, ...content] = lines;
        return `<h2>${heading.replace(':', '', '+').trim()}</h2>${content.map(line => `<p>${line.trim()}</p>`).join('')}`;
      } else {
        // Default to paragraph
        return `<p>${lines.join(' ')}</p>`;
      }
    });
  
    return headerSection +formattedSections.join('');
  }

  const checkHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();
      if (response.ok) {
        setHealthStatus(data.message);
      } else {
        alert('Health check failed.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while checking the API health.');
    }
  };

  return (
    <div className="home-container">
      <header className="header">
        <h1>Resume Analyzer</h1>
        <p className="tagline">Optimize your job application with tailored insights and tools.</p>
      </header>

      <div className="upload-container">
        <section className="upload-section">
            {/* <h2>Upload Your Files</h2> */}
            <FileUpload
            onResumeChange={handleResumeChange}
            onJobDescriptionChange={handleJobDescriptionChange}
            jobDescription={jobDescription}
            />
        </section>

        {showUserDetailsModal && (
          <UserDetailsModal
            onSubmit={handleUserDetailsSubmit}
            onClose={() => {
              setShowUserDetailsModal(false);
              setPendingResume(false);
            }}
          />
        )}
        <section className="action-buttons-section">
            <ActionButtons
            onAnalyze={handleAnalyze}
            onGenerateResume={handleGenerateCustomResume}
            onGenerateCoverLetter={handleGenerateCoverLetter}
            />
        </section>
      </div>

      <section className="feedback-section">
        {/* <h2>Results</h2> */}
        <FeedbackDisplay feedback={feedback} />
      </section>

      <section className="output-section">
        <CustomResumeDisplay customResume={customResume} userDetails={userDetails}/>
        <CoverLetterDisplay coverLetter={coverLetter} />
      </section>
    </div>
  );
}

export default Home;