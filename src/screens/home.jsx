// App.js
import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import ActionButtons from '../components/ActionButtons';
import FeedbackDisplay from '../components/FeedbackDisplay';
import CustomResumeDisplay from '../components/CustomResumeDisplay';
import CoverLetterDisplay from '../components/CoverLetterDisplay';
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

    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jobDescription', jobDescription);

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
        console.log('Generated Custom Resume:', data.custom_resume);
        setCustomResume(data.custom_resume);
      } else {
        alert(data.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while generating the custom resume.');
    }
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
        <CustomResumeDisplay customResume={customResume} />
        <CoverLetterDisplay coverLetter={coverLetter} />
      </section>
    </div>
  );
}

export default Home;