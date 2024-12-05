import React, {useState} from 'react';
import '../styles/FormatToolbar.css';

const FormatToolbar = ({ onFormat, selectedFontSize }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colors = ['#000000', '#2c3e50', '#3498db', '#e74c3c', '#27ae60', '#8e44ad', '#f39c12'];

  return (
    <div className="format-toolbar">
      <div className="format-group">
        <button onClick={() => onFormat('bold')} title="Bold">
          <i className="fas fa-bold"></i>
        </button>
        <button onClick={() => onFormat('italic')} title="Italic">
          <i className="fas fa-italic"></i>
        </button>
        <button onClick={() => onFormat('underline')} title="Underline">
          <i className="fas fa-underline"></i>
        </button>
      </div>

      <div className="format-group">
        <button onClick={() => onFormat('alignLeft')} title="Align Left">
          <i className="fas fa-align-left"></i>
        </button>
        <button onClick={() => onFormat('alignCenter')} title="Align Center">
          <i className="fas fa-align-center"></i>
        </button>
        <button onClick={() => onFormat('alignRight')} title="Align Right">
          <i className="fas fa-align-right"></i>
        </button>
      </div>

      <div className="format-group font-size-controls">
        <button onClick={() => onFormat('decreaseFontSize')} title="Decrease font size">
          <i className="fas fa-minus"></i>
        </button>
        <span className="font-size-display">{selectedFontSize}px</span>
        <button onClick={() => onFormat('increaseFontSize')} title="Increase font size">
          <i className="fas fa-plus"></i>
        </button>
      </div>

      <div className="format-group">
        <button onClick={() => onFormat('bulletList')} title="Bullet list">
          <i className="fas fa-list-ul"></i>
        </button>
        <button onClick={() => onFormat('numberList')} title="Number list">
          <i className="fas fa-list-ol"></i>
        </button>
      </div>

      <div className="format-group color-picker">
        <button 
          onClick={() => setShowColorPicker(!showColorPicker)} 
          title="Text Color"
          className="color-button"
        >
          <i className="fas fa-palette"></i>
        </button>
        {showColorPicker && (
          <div className="color-palette">
            {colors.map((color) => (
              <button
                key={color}
                className="color-option"
                style={{ backgroundColor: color }}
                onClick={() => {
                  onFormat('color', color);
                  setShowColorPicker(false);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormatToolbar;