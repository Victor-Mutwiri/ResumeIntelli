import React from 'react';

function CustomResumeDisplay({ customResume }) {
  if (!customResume) return null;

  return (
    <div className="custom-resume-container">
      <h2>Custom Resume:</h2>
      <div className="custom-resume-content">
        {customResume.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );
}

export default CustomResumeDisplay;