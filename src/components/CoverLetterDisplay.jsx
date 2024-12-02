import React from 'react';

function CoverLetterDisplay({ coverLetter }) {
  if (!coverLetter) return null;

  return (
    <div className="cover-letter-container">
      <h2>Cover Letter:</h2>
      <div className="cover-letter-content">
        {coverLetter.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );
}

export default CoverLetterDisplay;