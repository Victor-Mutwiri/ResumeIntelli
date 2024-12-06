import React, { useState, useEffect, useRef } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import ResumePDF from './ResumePDF';
import FormatToolbar from './FormatToolbar';
import '../styles/CustomResumeDisplay.css';

const CustomResumeDisplay = ({ customResume, userDetails }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(customResume);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (customResume) {
      setEditedContent(customResume);
    }
  }, [customResume]);

  const handleFormat = (command, value = null) => {
    if (!editorRef.current) return;

    // Get the current selection
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);

    if (!selection || !range) return;

    // Handle different formatting commands
    switch (command) {
      case 'bold':
        applyInlineStyle('font-weight', 'bold');
        break;
      case 'italic':
        applyInlineStyle('font-style', 'italic');
        break;
      case 'underline':
        applyInlineStyle('text-decoration', 'underline');
        break;
      case 'alignLeft':
        applyBlockStyle('text-align', 'left');
        break;
      case 'alignCenter':
        applyBlockStyle('text-align', 'center');
        break;
      case 'alignRight':
        applyBlockStyle('text-align', 'right');
        break;
      case 'color':
        applyInlineStyle('color', value);
        break;
      case 'bulletList':
        createList('ul');
        break;
      case 'numberList':
        createList('ol');
        break;
      default:
        console.warn(`Unsupported format command: ${command}`);
    }

    // Restore focus to the editor
    editorRef.current.focus();
  };

  const applyInlineStyle = (property, value) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style[property] = value;
    
    range.surroundContents(span);
  };

  const applyBlockStyle = (property, value) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    let block = range.commonAncestorContainer;
    
    // Find the closest block-level element
    while (block && block.nodeType === Node.TEXT_NODE) {
      block = block.parentNode;
    }

    if (block && block instanceof HTMLElement) {
      block.style[property] = value;
    }
  };

  const createList = (listType) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    const list = document.createElement(listType);
    const listItem = document.createElement('li');
    
    // Get the selected content
    const content = range.extractContents();
    listItem.appendChild(content);
    list.appendChild(listItem);
    
    range.insertNode(list);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowPdfPreview(false);
  };

  const handleSave = () => {
    if (editorRef.current) {
      setEditedContent(editorRef.current.innerHTML);
    }
    setIsEditing(false);
  };

  const handlePreviewPDF = () => {
    setShowPdfPreview(true);
    setIsEditing(false);
  };

  if (!editedContent) return null;

  return (
    <div className="custom-resume-container">
      {isEditing ? (
        <>
          <FormatToolbar onFormat={handleFormat} />
          <div
            ref={editorRef}
            className="custom-resume-content editable"
            contentEditable={true}
            dangerouslySetInnerHTML={{ __html: editedContent }}
            suppressContentEditableWarning={true}
          />
          <div className="editor-actions">
            <button onClick={handleSave}>Save Changes</button>
          </div>
        </>
      ) : (
        <>
          <div
            className="custom-resume-content"
            dangerouslySetInnerHTML={{ __html: editedContent }}
          />
          <div className="editor-actions">
            <button onClick={handleEdit}>Edit Resume</button>
            <button onClick={handlePreviewPDF}>Preview PDF</button>
            <PDFDownloadLink
              document={<ResumePDF content={editedContent} userDetails={userDetails} />}
              fileName="resume.pdf"
              className="download-button"
            >
              {({ blob, url, loading, error }) =>
                loading ? 'Loading document...' : 'Download PDF'
              }
            </PDFDownloadLink>
          </div>
          
          {showPdfPreview && (
            <div className="pdf-preview-container">
              <PDFViewer width="100%" height="600px">
                <ResumePDF content={editedContent} userDetails={userDetails} />
              </PDFViewer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomResumeDisplay;