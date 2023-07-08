import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import { Button, Chip, TextField } from '@mui/material';
import { updateResume, deleteResume } from './utils/api';


const ResumeDatabase = () => {
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editedResume, setEditedResume] = useState(null);

  const resumesPerPage = 2;
  const totalPages = Math.ceil((resumeData && resumeData.length) ? resumeData.length / resumesPerPage : 0);

  useEffect(() => {
    fetchResumeData();
  }, []);

  const fetchResumeData = () => {
    setLoading(true);
    setError(null);

    axios
      .get('http://localhost:3000/fetch')
      .then(response => {
        setLoading(false);
        setResumeData(response.data);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
        setError('An error occurred while fetching resume data.');
      });
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleDeleteResume = (resumeId) => {
    // Send delete request to delete the resume
    deleteResume(resumeId)
      .then(() => {
        console.log('Resume deleted successfully:', resumeId);
        // Remove the deleted resume from the resumeData state
        setResumeData(prevData => prevData.filter(resume => resume.id !== resumeId));
      })
      .catch((error) => {
        console.error('Error deleting resume:', error);
      });
  };

  const handleExpandText = (index) => {
    setResumeData(prevData =>
      prevData.map((resume, i) => {
        if (i === index) {
          return {
            ...resume,
            expanded: true
          };
        }
        return resume;
      })
    );
  };

  const handleCollapseText = (index) => {
    setResumeData(prevData =>
      prevData.map((resume, i) => {
        if (i === index) {
          return {
            ...resume,
            expanded: false
          };
        }
        return resume;
      })
    );
  };

  const handleExpandResume = (resumeId) => {
    setResumeData(prevData =>
      prevData.map((resume) => {
        if (resume.id === resumeId) {
          return {
            ...resume,
            expandedResumes: !resume.expandedResumes
          };
        }
        return resume;
      })
    );
  };

  const handleEditResume = (resumeId) => {
    const resumeToEdit = resumeData.find((resume) => resume.id === resumeId);
    if (resumeToEdit) {
      setEditedResume({ ...resumeToEdit });
    }
  };

  const handleSaveResume = () => {
    if (editedResume) {
      console.log('Saving resume:', editedResume); // Log the resume data before sending the request
      updateResume(editedResume.id, editedResume)
        .then(() => {
          console.log('Resume updated successfully:', editedResume.id);
          const updatedResumeData = resumeData.map((resume) => {
            if (resume.id === editedResume.id) {
              return {
                ...resume,
                name: editedResume.name,
                email: editedResume.email,
                experience: editedResume.experience,
                education: editedResume.education,
                skills: JSON.stringify(editedResume.skills),
                status: 1, // Set the edited status to 1
              };
            }
            return resume;
          });
          setResumeData(updatedResumeData);
          setEditedResume(null);
        })
        .catch((error) => {
          console.error('Error updating resume:', error);
        });
    }
  };

  const handleCancelEdit = () => {
    setEditedResume(null);
  };

  const handleResumeFieldChange = (field, value) => {
    setEditedResume((prevResume) => ({
      ...prevResume,
      [field]: value,
    }));
  };

  const handleRemoveSkill = (resumeId, skillIndex) => {
    setResumeData((prevData) =>
      prevData.map((resume) => {
        if (resume.id === resumeId) {
          const updatedSkills = [...resume.skills];
          updatedSkills.splice(skillIndex, 1);
          return {
            ...resume,
            skills: updatedSkills,
          };
        }
        return resume;
      })
    );
  };

  const startIndex = (currentPage - 1) * resumesPerPage;
  const endIndex = startIndex + resumesPerPage;
  const currentResumes = resumeData && resumeData.length > 0 ? resumeData.slice(startIndex, endIndex) : [];

  if (loading) {
    return (
      <Container maxWidth="lg" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px', marginBottom: '20px', textAlign: 'center' }}>
      <Typography variant="subtitle1" component="p" style={{ margin: '10px' }}>
        Total Resumes: {resumeData.length}
      </Typography>
      {currentResumes.length > 0 ? (
        <div className="results-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {currentResumes.map((resume, index) => (
            <div className="card p-3 mb-3" key={resume.id} style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <div style={{ position: 'relative' }}>
                {editedResume && editedResume.id === resume.id ? (
                  // Edit mode
                  <>
                    <div style={{ display: 'flex', marginBottom: '10px' }}>
                      <TextField
                        label="Name"
                        value={editedResume.name}
                        onChange={(e) => handleResumeFieldChange('name', e.target.value)}
                        style={{ marginRight: '10px' }}
                      />
                      <TextField
                        label="Email"
                        value={editedResume.email}
                        onChange={(e) => handleResumeFieldChange('email', e.target.value)}
                      />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <TextField
                        label="Experience"
                        value={editedResume.experience}
                        onChange={(e) => handleResumeFieldChange('experience', e.target.value)}
                        multiline
                        rows={4}
                        fullWidth
                      />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <TextField
                        label="Education"
                        value={editedResume.education}
                        onChange={(e) => handleResumeFieldChange('education', e.target.value)}
                        multiline
                        rows={4}
                        fullWidth
                      />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <TextField
                        label="Skills"
                        value={editedResume.skills}
                        onChange={(e) => handleResumeFieldChange('skills', e.target.value)}
                        fullWidth
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleCancelEdit}
                        style={{ marginRight: '10px' }}
                      >
                        Cancel
                      </Button>
                      <Button variant="contained" color="primary" onClick={handleSaveResume}>
                        Save
                      </Button>
                    </div>
                  </>
                ) : (
                  // View mode
                  <>
                    {resume.status === 1 && (
                      <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                        <Button variant="contained" color="secondary" style={{ fontSize: '10px', fontWeight: 'bold' }}>
                          Edited
                        </Button>
                      </div>
                    )}
                    <Typography variant="subtitle1" component="h4">
                      <h4>{resume.name}</h4>
                      {resume.email}
                    </Typography>
                    <hr />
                    <Typography variant="subtitle1" component="p">
                      <h5>Experience</h5> {resume.experience}
                    </Typography>
                    <hr />
                    <Typography variant="subtitle1" component="p">
                      <h5>Education</h5> {resume.education}
                    </Typography>
                    {/* Render additional content for the view mode */}
                    {resume.skills && typeof resume.skills === 'string' && resume.skills.length > 0 && (
                      <div>
                        <hr />
                        <Typography variant="subtitle1" component="p">
                          <h5>Skills</h5>
                          {resume.skills
                            .replace(/[\[\]\\"]/g, '')
                            .split(',')
                            .map((skill) => (
                              <Chip key={skill.trim()} label={skill.trim()} variant="outlined" style={{ margin: '2px' }} />
                            ))}
                        </Typography>
                        <hr />
                      </div>
                    )}
                    {resume.text && resume.text.length > 10 && !resume.expanded ? (
                      <Button variant="contained" color="primary" onClick={() => handleExpandText(index)}>
                        Expand Text
                      </Button>
                    ) : null}
                    {resume.text && resume.text.length > 10 && resume.expanded ? (
                      <>
                        <p>{resume.text}</p>
                        <Button variant="contained" color="primary" onClick={() => handleCollapseText(index)}>
                          Collapse Text
                        </Button>
                      </>
                    ) : null}
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDeleteResume(resume.id)} // Add onClick handler for delete button
                      style={{ position: 'absolute', top: '10px', right: '-0px', marginLeft: '15px' }} // Position the button to the top right
                      
                    >
                      Delete
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEditResume(resume.id)} // Add onClick handler for edit button
                      style={{ position: 'absolute', top: '10px', right: '90px' }} // Position the button to the top right
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Typography variant="subtitle1" component="p" style={{ margin: '10px' }}>
          No resumes found.
        </Typography>
      )}

      {resumeData.length > resumesPerPage && (
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          variant="outlined"
          shape="rounded"
          style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
        />
      )}
    </Container>
  );
};

export default ResumeDatabase;
