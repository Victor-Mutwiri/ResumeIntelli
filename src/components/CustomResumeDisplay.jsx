import React from 'react';
import '../styles/CustomResumeDisplay.css';

function CustomResumeDisplay({ customResume }) {
  if (!customResume) return null;

  return (
    <div className="custom-resume-container">
      <h2>Custom Resume:</h2>
      <div className="custom-resume-content">
      {customResume.split('\n').map((line, index) => (
          line.startsWith('-') 
          ? <li key={index}>{line.slice(1).trim()}</li> 
          : <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );
}

export default CustomResumeDisplay;