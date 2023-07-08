import React, { useState, useEffect, useRef } from 'react';

function DataField({ label, value, field, handleEdit, isTextArea = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [numberOfRows, setNumberOfRows] = useState(value ? value.split('\n').length : 1);
  const inputRef = useRef(null);

  const handleEditChange = (event) => {
    setTempValue(event.target.value);
    setNumberOfRows(event.target.value.split('\n').length);
  };

  const handleToggleEdit = () => {
    setTempValue(value);
    setIsEditing(!isEditing);
  };

  const handleSaveEdit = () => {
    handleEdit(field, tempValue);
    setIsEditing(false);
  };

  useEffect(() => {
    setNumberOfRows(value ? value.split('\n').length : 1);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const inputStyle = isTextArea ? 'textarea-field-value' : 'input-field-value';

  return (
    <div className="mb-3">
      <div className={`d-flex justify-content-start align-items-center ${isEditing ? 'expanded' : ''}`}>
        <label className="form-label field-label">
          <strong>{label}: </strong>
        </label>
        {!isEditing ? (
          <div className="d-flex align-items-center">
            <pre className="field-value" style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
              {value || '-'}
            </pre>
            <button
              className="btn btn-sm btn-primary edit-button"
              onClick={handleToggleEdit}
              style={{ color: '#000', fontSize: '10px', marginBottom: '5px', marginLeft: '5px' }}
            >
              ✎
            </button>
          </div>
        ) : (
          <div className="d-flex align-items-start flex-column" style={{ width: '100%' }}>
            {isTextArea ? (
              <textarea
                rows={numberOfRows} // Use the dynamic number of rows
                className={`form-control ${inputStyle}`}
                value={tempValue}
                onChange={handleEditChange}
                style={{ flex: 1, minHeight: '6em', resize: 'none' }}
                ref={inputRef}
              />
            ) : (
              <input
                className={`form-control ${inputStyle}`}
                value={tempValue}
                onChange={handleEditChange}
                style={{ flex: 1 }}
                ref={inputRef}
              />
            )}
            <div className="d-flex">
              <button
                className={`btn btn-sm ${isEditing ? 'btn-success' : 'btn-secondary'} ms-2`}
                onClick={handleSaveEdit}
                style={{ backgroundColor: '#28a745', color: '#fff', marginTop: '5px' }}
              >
                Save
              </button>
              <button
                className={`btn btn-sm ${isEditing ? 'btn-secondary' : 'btn-success'} ms-2`}
                onClick={handleToggleEdit}
                style={{ backgroundColor: '#6c757d', color: '#fff', marginTop: '5px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataField;
