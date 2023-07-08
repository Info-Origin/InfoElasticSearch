import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function SkillsSection({ skills, handleEdit, handleRemoveSkill }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const handleSaveSkill = () => {
    if (newSkill.trim() === '') {
      return; // Don't add empty skills
    }
    const skillsToAdd = newSkill.split(',').map((skill) => skill.trim());
    handleEdit('skills', [...(skills || []), ...skillsToAdd]);
    setNewSkill('');
    setIsEditing(false);
  };
  

  if (typeof skills !== 'object') {
    return <Typography variant="subtitle1" component="p">Invalid skills data.</Typography>;
  }

  return (
    <div className="skills-section">
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <label className="form-label skills-label" style={{ marginTop: '15px' }}>
            <strong>Skills:</strong>
          </label>
          <div className="skills-list w-100">
            {skills && Object.keys(skills).length > 0 ? (
              <div className="skills-list">
                {Object.values(skills).map((skill, skillIndex) => (
                  <Chip
                    key={skillIndex}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skillIndex)}
                    variant="outlined"
                    style={{ marginRight: '5px', marginBottom: '5px' }}
                  />
                ))}
              </div>
            ) : (
              <Typography variant="subtitle1" component="p">No skills found.</Typography>
            )}
            {isEditing && (
              <div className="input-group w-25" style={{ marginLeft: '20px', marginTop: '10px' }}>
                <TextField
                  label="Add new skill"
                  value={newSkill}
                  onChange={(event) => setNewSkill(event.target.value)}
                  style={{ marginRight: '5px' }}
                />
                <Button variant="contained" onClick={handleSaveSkill} style={{ backgroundColor: '#28a745', color: '#fff' }}>
                  Add
                </Button>
              </div>
            )}
          </div>
          {!isEditing ? (
            <button
              className="btn btn-sm btn-primary edit-button"
              onClick={() => setIsEditing(true)}
              style={{ color: 'black', fontSize: '10px', marginBottom: '5px', marginLeft: '5px' }}
            >
              ✎
            </button>
          ) : (
            <button
              className="btn btn-sm btn-danger edit-button"
              onClick={() => setIsEditing(false)}
              style={{ color: 'black', fontSize: '10px', marginBottom: '40px', marginLeft: '5px' }}
            >
              ✖
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SkillsSection;
