import React from 'react';
import '../styles/FeedbackDisplay.css'; // Add this line for custom styles

function FeedbackDisplay({ feedback }) {
  if (!feedback) return null;

  return (
    <div className="feedback-container">
      <h2 className="feedback-title">Analysis Feedback</h2>
      <div className="feedback-content" dangerouslySetInnerHTML={{ __html: feedback }} />
    </div>
  );
}

export default FeedbackDisplay;
