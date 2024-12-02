// App.js
import { useState } from 'react';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;  // Adjust the port if different

function App() {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [feedback, setFeedback] = useState('');
  const [customResume, setCustomResume] = useState('');
  const [healthStatus, setHealthStatus] = useState('');

  const handleResumeChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
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
        setCustomResume(data.custom_resume);
      } else {
        alert(data.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while generating the custom resume.');
    }
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
    <div>
      <h1>Resume Analyzer</h1>
      <div className="input-container">
        <input type="file" accept=".pdf" onChange={handleResumeChange} />
        <textarea
          placeholder="Job Description"
          value={jobDescription}
          onChange={handleJobDescriptionChange}
          rows={4}
        />
        <div className="button-group">
          <button onClick={handleAnalyze}>Analyze Resume</button>
          <button onClick={handleGenerateCustomResume}>Generate Custom Resume</button>
        </div>
      </div>

      {feedback && (
        <div className="feedback-container">
          <h2>Analysis Feedback:</h2>
          <div dangerouslySetInnerHTML={{ __html: feedback }} />
        </div>
      )}

      {customResume && (
        <div className="custom-resume-container">
          <h2>Custom Resume:</h2>
          <div className="custom-resume-content">
            {customResume.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;