import React, { useState } from 'react';
import './css/ModificationSelector.css';

const ModificationSelector = ({ 
  dropdownLabel = "Select a section to re-build",
  textareaLabel = "Describe your changes",
  placeholder = "Enter your prompt to re-build here...",
  submitButtonText = "Re-build",
  cancelButtonText = "Cancel",
  options = [],
  stage,
  onCancel,
  isLoading = false
}) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [modificationText, setModificationText] = useState('');
  const [error, setError] = useState('');

  // const handleSubmit = async () => {
  //   if (!selectedOption) {
  //     setError('Please select an option');
  //     return;
  //   }
  //   if (!modificationText.trim()) {
  //     setError('Please describe your changes');
  //     return;
  //   }

  //   const selected = options.find(opt => opt.value === selectedOption);
  //   const fullValue = selected?.fullValue;

  //     console.log("Submitted Info:");
  //     console.log("Stage Full Value:", stage);
  //     console.log("Selected Dropdown Label:", selected.label);
  //     console.log("Selected Dropdown Value:", selected.value);
  //     console.log("Full Value:", fullValue);
  //     console.log("Modification Prompt:", modificationText);


  //   setError('');
  //   try {
  //     const response = await fetch('http://localhost:8000/course/redo', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       stage: stage || stage.value,
  //       prev_content:fullValue,
  //       user_message: `Edit the part identified by: ${selected.value} with refernce to the prompt provided by the user :${modificationText}`,
  //     }),
  //   });

  //   const data = await response.json();
  //   if (!response.ok) {
  //     throw new Error(data?.error || 'API request failed');
  //   }

  //   console.log("API Response:", data);
  //     setSelectedOption('');
  //     setModificationText('');
  //   } catch (err) {
  //     setError('Failed to submit changes. Please try again.');
  //   }
  // };

  const handleSubmit = async () => {
  if (!selectedOption) {
    setError('Please select an option');
    return;
  }
  if (!modificationText.trim()) {
    setError('Please describe your changes');
    return;
  }

  const selected = options.find(opt => opt.value === selectedOption);
  const fullValue = selected?.fullValue;

  console.log("Submitted Info:");
  console.log("Stage:", stage);
  console.log("Selected Dropdown Label:", selected.label);
  console.log("Selected Dropdown Value:", selected.value);
  console.log("Full Value:", fullValue);
  console.log("Modification Prompt:", modificationText);
  isLoading = true;
  setError('');

  try {
    const response = await fetch('http://localhost:8000/course/redo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stage,
        prev_content: fullValue,
        user_message: `Edit the part identified by: ${selected.value} with reference to the prompt provided by the user: ${modificationText}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || 'API request failed');
    }

    console.log("API Response:", data);

    // ✅ Update localStorage with the modified data
    const raw = localStorage.getItem("generatedCourse");
    if (raw) {
      const parsed = JSON.parse(raw);

      if (stage === 'outline') {
        parsed.outline = data.result;  // assuming API returns full updated outline
      } else if (stage === 'module') {
        parsed.modules = data.result.modules || data.result; // depending on what API sends
      } else if (stage === 'submodule') {
        const moduleIndex = options.findIndex(opt => opt.value === selected.value);
        if (parsed.modules?.[moduleIndex]) {
          parsed.modules[moduleIndex].submodules = data.result;
        }
      } else if (stage === 'activity') {
        const path = window.location.pathname;
        const match = path.match(/\/activities\/(\d+)\/(\d+)/);
        const moduleIndex = match ? parseInt(match[1]) : null;
        const submoduleIndex = match ? parseInt(match[2]) : null;

        if (parsed.modules?.[moduleIndex]?.submodules?.[submoduleIndex]) {
          parsed.modules[moduleIndex].submodules[submoduleIndex].activities = data.result;
        }
      }

      localStorage.setItem("generatedCourse", JSON.stringify(parsed));
      window.location.reload();
    }

    // Clear inputs after success
    setSelectedOption('');
    setModificationText('');
  } catch (err) {
    console.error(err);
    setError('Failed to submit changes. Please try again.');
  }
};

  return (
    <div className="modification-section">
      <div className="form-group-modification">
        <label className="form-label-modification">{dropdownLabel}</label>
        <select 
          className="select-dropdown-modification" 
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          disabled={isLoading}
        >
          <option value="">Select an option...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} fullValue={option.fullValue}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group-modification">
        <label className="form-label-modification">{textareaLabel}</label>
        <textarea 
          className="modification-textarea-modification" 
          value={modificationText}
          onChange={(e) => setModificationText(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="action-buttons">
        <button 
          className="build-btn" 
          onClick={handleSubmit}
          disabled={isLoading || options.length === 0 || !selectedOption || !modificationText.trim()}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span> Processing...
            </>
          ) : (
            submitButtonText
          )}
        </button>
        <button 
          className="cancel-btn" 
          onClick={onCancel}
          disabled={isLoading || options.length === 0 || !selectedOption || !modificationText.trim()}
        >
          {cancelButtonText}
        </button>
      </div>
    </div>
  );
};

export default ModificationSelector;
