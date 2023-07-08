import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import 'typeface-roboto';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { saveData } from './components/utils/api';
import ResumeParserSection from './components/ResumeParserSection';
import SearchCandidatesSection from './components/SearchCandidatesSection';
import ResumeDatabase from './components/ResumeDatabase';


function App() {
  const [activeSection, setActiveSection] = useState('resumeParser');
  const [editedData, setEditedData] = useState({
    name: '',
    email: '',
    experience: '',
    education: '',
    skills: [],
  });
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [resumeData, setResumeData] = useState([]);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    // Clear success message after 3 seconds
    if (successMessage) {
      const timeout = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

  useEffect(() => {
    const viewportMetaTag = document.querySelector('meta[name="viewport"]');
    const zoomLevel = 0.8;
    viewportMetaTag.content = `width=device-width, initial-scale=${zoomLevel}, maximum-scale=${zoomLevel}, minimum-scale=${zoomLevel}, user-scalable=no`;
  }, []);

  const handleEdit = (field, value) => {
    setEditedData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!editedData.name || !editedData.email) {
      setError('Name and email are required fields.');
      return;
    }

    setIsSaving(true);

    saveData(editedData)
      .then((response) => {
        console.log(response.data);
        setIsSaving(false);
        setSuccessMessage('Data saved successfully.');
        setError(null); // Reset the error state
      })
      .catch((error) => {
        console.log(error);
        setIsSaving(false);
        setError('An error occurred while saving the data. Please try again later.');
      });
  };

  const handleRemoveSkill = (index) => {
    setEditedData((prevData) => {
      const updatedSkills = [...prevData.skills];
      updatedSkills.splice(index, 1);
      return {
        ...prevData,
        skills: updatedSkills,
      };
    });
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const handleSync = () => {
    setError(null); // Reset the error state
    setSuccessMessage(null); // Reset the success message
    setLoading(true);

    axios
      .post('http://localhost:3000/sync')
      .then((response) => {
        console.log(response.data);
        setLoading(false);
        if (response.data.success) {
          const { newCount, updatedCount } = response.data;
          setSyncResult({ newCount, updatedCount }); // Set the sync result
          setSuccessMessage(`Data synced successfully. ${newCount} new records added, ${updatedCount} records updated.`);
        } else {
          setError('An error occurred while syncing data.');
        }
        setTimeout(() => {
          setSuccessMessage(null);
          setSyncResult(null); // Clear the sync result
        }, 3000);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
        setError('An error occurred');
      });
  };

  return (
    <div>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            {activeSection !== 'resumeParser' && (
              <Button
                className={`nav-link ${activeSection === 'resumeParser' ? 'active' : ''}`}
                onClick={() => handleSectionClick('resumeParser')}
                style={{ color: activeSection === 'resumeParser' ? 'inherit' : 'white', marginRight: '10px' }}
              >
                Resume Parser
              </Button>
            )}
            {activeSection !== 'searchCandidates' && (
              <Button
                className={`nav-link ${activeSection === 'searchCandidates' ? 'active' : ''}`}
                onClick={() => handleSectionClick('searchCandidates')}
                style={{ color: activeSection === 'searchCandidates' ? 'inherit' : 'white', margin: '0 10px' }}
              >
                Candidate Search
              </Button>
            )}
            {activeSection !== 'resumeDatabase' && (
              <Button
                className={`nav-link ${activeSection === 'resumeDatabase' ? 'active' : ''}`}
                onClick={() => handleSectionClick('resumeDatabase')}
                style={{ color: activeSection === 'resumeDatabase' ? 'inherit' : 'white', marginLeft: '10px' }}
              >
                Resume Database
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography
              variant="h4"
              component="h1"
              className={`${activeSection === 'resumeParser' ? 'active' : ''}`}
              sx={{
                fontWeight: 'bold',
                fontSize: '40px',
                textAlign: 'center',
                padding: '5px',
                flexGrow: 1,
                marginLeft: '-70%',
              }}
            >
              {activeSection === 'resumeParser'
                ? 'Resume Parser'
                : activeSection === 'searchCandidates'
                ? 'Candidate Search'
                : 'Resume Database'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color={successMessage === 'Data synced successfully.' ? 'success' : 'warning'}
            disabled={loading}
            onClick={handleSync}
            endIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Syncing...' : successMessage ? 'Data Synced Successfully' : 'Sync to Elasticsearch'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" style={{ marginTop: '20px', marginBottom: '20px', textAlign: 'center' }}>
        {/* Removed the Typography component here */}
      </Container>

      <div>
        {/* Render the different sections based on the activeSection state */}
        {activeSection === 'resumeParser' && (
          <ResumeParserSection
            editedData={editedData}
            loading={loading}
            showPreview={showPreview}
            error={error}
            successMessage={successMessage}
            isSaving={isSaving}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleRemoveSkill={handleRemoveSkill}
          />
        )}
        {activeSection === 'searchCandidates' && (
          <SearchCandidatesSection
            successMessage={successMessage}
            showSearchResults={showSearchResults}
            resumeData={resumeData}
          />
        )}
        {activeSection === 'resumeDatabase' && (
          <ResumeDatabase successMessage={successMessage} resumeData={resumeData} />
        )}
      </div>

      {syncResult && (
        <Container maxWidth="lg" style={{ marginTop: '20px', marginBottom: '20px', textAlign: 'center' }}>
          <Typography variant="h6" component="p" color="success">
            Data synced successfully. {syncResult.newCount} new records added, {syncResult.updatedCount} records updated.
          </Typography>
        </Container>
      )}
    </div>
  );
}

export default App;
