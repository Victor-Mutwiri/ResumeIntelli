import React, { useState, useRef, useEffect } from 'react';
import FormatToolbar from './FormatToolbar';
import '../styles/CustomResumeDisplay.css';

const CustomResumeDisplay = ({ customResume }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(customResume);
  const editorRef = useRef(null);

  useEffect(() => {
    setEditedContent(customResume);
  }, [customResume]);

  const handleFormat = (formatType) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText) return;

    switch (formatType) {
      case 'bold':
        applyFormatting('strong');
        break;
      case 'italic':
        applyFormatting('em');
        break;
      case 'underline':
        applyFormatting('u');
        break;
      case 'increaseFontSize':
        const fontSize = parseInt(window.getComputedStyle(range.commonAncestorContainer.parentElement).fontSize);
        applyStyle({ fontSize: `${fontSize + 2}px` });
        break;
      case 'decreaseFontSize':
        const currentSize = parseInt(window.getComputedStyle(range.commonAncestorContainer.parentElement).fontSize);
        applyStyle({ fontSize: `${Math.max(currentSize - 2, 8)}px` });
        break;
      case 'bulletList':
        createList('ul');
        break;
      case 'numberList':
        createList('ol');
        break;
      default:
        break;
    }
  };

  const applyFormatting = (tag) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const element = document.createElement(tag);
    
    try {
      range.surroundContents(element);
    } catch (e) {
      console.warn('Could not apply formatting:', e);
    }
  };

  const applyStyle = (styles) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    Object.assign(span.style, styles);
    
    try {
      range.surroundContents(span);
    } catch (e) {
      console.warn('Could not apply style:', e);
    }
  };

  const createList = (listType) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const list = document.createElement(listType);
    const listItem = document.createElement('li');
    
    try {
      listItem.appendChild(range.extractContents());
      list.appendChild(listItem);
      range.insertNode(list);
    } catch (e) {
      console.warn('Could not create list:', e);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editorRef.current) {
      setEditedContent(editorRef.current.innerHTML);
    }
    setIsEditing(false);
  };

  if (!customResume) return null;

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
          </div>
        </>
      )}
    </div>
  );
};

export default CustomResumeDisplay;