import React from 'react';
import '../styles/FileUpload.css';

function FileUpload({ onResumeChange, onJobDescriptionChange, jobDescription }) {
  return (
    <div className="file-upload-container">
      <div className="upload-section">
        <label htmlFor="resume-upload" className="upload-label">
          Upload Resume (PDF)
        </label>
        <input
          id="resume-upload"
          type="file"
          accept=".pdf"
          onChange={onResumeChange}
          className="file-input"
        />
      </div>
      <div className="textarea-section">
        <label htmlFor="job-description" className="textarea-label">
          Job Description
        </label>
        <textarea
          id="job-description"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={onJobDescriptionChange}
          rows={6}
          className="textarea"
        />
      </div>
    </div>
  );
}

export default FileUpload;
