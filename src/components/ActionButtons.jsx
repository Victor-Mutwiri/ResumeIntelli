import React from 'react';
import '../styles/ActionButtons.css'; // Importing styles for the buttons

function ActionButtons({ onAnalyze, onGenerateResume, onGenerateCoverLetter }) {
  return (
    <div className="button-group">
      <button className="action-button analyze" onClick={onAnalyze}>
        Analyze Resume
      </button>
      <button className="action-button generate-resume" onClick={onGenerateResume}>
        Generate Custom Resume
      </button>
      <button className="action-button generate-cover-letter" onClick={onGenerateCoverLetter}>
        Generate Cover Letter
      </button>
    </div>
  );
}

export default ActionButtons;
