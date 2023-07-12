import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import axios from 'axios';

import DataField from './DataField';
import SkillsSection from './SkillsSection';
import { uploadResume, saveData } from './utils/api';
const AWS = require('aws-sdk');
const ID = 'yourKeyHere';
const SECRET = 'yourSecretKeyHere';
const BUCKET_NAME = 'bucketName';

AWS.config.update({
    accessKeyId: ID,
    secretAccessKey: SECRET
});

const s3 = new AWS.S3();

function ResumeParserSection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [method, setMethod] = useState('');
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [fileName, setFileName] = useState('');
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
  
  useEffect(() => {
    // Clear success message after 5 seconds
    if (successMessage) {
      const timeout = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setIsFileSelected(Boolean(file));
    setFileName(file ? file.name : '');
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
  
    setLoading(true);
    setSuccessMessage(null);
  
    const fileContent = selectedFile;
    const params = {
      Bucket: 'kcuberesumes',
      Key: 'uploads/' + selectedFile.name,
      Body: fileContent
    };
  
    s3.upload(params, function(err, data) {
      setLoading(false);
      if (err) {
        setError('An error occurred while uploading the file. Please try again later.');
        console.log(err);
      } else {
        setSuccessMessage('File uploaded successfully.');
        setError(null);
 
      }
    });
  };
  
  

  const handleMethodChange = (event) => {
    setMethod(event.target.value);
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      setError('Please select a file to parse.');
      return;
    }
    if (method === '') {
      setError('Please choose a parsing method.');
      return;
    }
  
    setLoading(true);
    setSuccessMessage(null);
  
    const params = {
      Bucket: BUCKET_NAME,
      Key: 'uploads/' + selectedFile.name
    };
  
    s3.getObject(params, function(err, data) {
      if (err) {
        setLoading(false);
        setError('An error occurred while downloading the file. Please try again later.');
        console.log(err);
      } else {
        const downloadedFile = new File([data.Body], selectedFile.name, { type: selectedFile.type });
        const formData = new FormData();
        formData.append('resume', downloadedFile);
        formData.append('method', method);
  
        console.log('File downloaded successfully.'); // New console log statement
  
        uploadResume(formData)
          .then((response) => {
            setLoading(false);
            if (
              'name' in response.data &&
              'email' in response.data &&
              'experience' in response.data &&
              'education' in response.data &&
              'skills' in response.data
            ) {
              const parsedData = response.data;
              setParsedData(parsedData);
              setEditedData(parsedData);
              setShowPreview(true);
              setError(null);
              setSuccessMessage('Resume parsed successfully.');
            } else {
              setError('Error: Expected properties not found in response data.');
            }
          })
          .catch((error) => {
            setLoading(false);
            setError('An error occurred while parsing the resume. Please try again later.');
            console.log(error);
          });
      }
    });
  };
  
  

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
  

  const handleCancelFile = () => {
    setSelectedFile(null);
    setIsFileSelected(false);
    setFileName('');
  };

  const limitText = (text, limit) => {
    if (text.length <= limit) {
      return text;
    }
    return text.substring(0, limit) + '...';
  };

  return (
    <div className="app-container">
      <div className="app container">
        <div className="text-center mb-3">
          <div>
            {fileName ? (
              <div className="selected-file" >
                <strong className="file-label" style={{margin: "10px 5px"}}>Selected File: </strong>
                <span className="file-name">{fileName.length > 15 ? `${fileName.substring(0, 15)}...` : fileName}</span>
                <button className="cancel-file" onClick={handleCancelFile}>
                  ×
                </button>
              </div>
            ) : (
              <div>
                <label htmlFor="resume-upload" className="btn btn-dark" style={{ height: '30px', paddingBottom: '30px' }}>
                  Select file for upload (.pdf)
                </label>
                <input id="resume-upload" className="form-control visually-hidden" type="file" onChange={handleFileChange} />
              </div>
            )}
          </div>
          <button
  className={`btn btn-primary upload-btn ${isFileSelected ? '' : 'disabled'}`}
  onClick={handleUpload}
  disabled={!isFileSelected}
>
  Upload
</button>

          <div className="mt-2">
            <select className="form-control-lg mx-2" onChange={handleMethodChange} value={method}>
              <option value="" disabled>
                Choose Parsing Method
              </option>
              <option value="javascript">Javascript Parsing</option>
              <option value="nlp">NLP Parsing</option>
            </select>
            <button
              className={`btn btn-warning parse-btn ${isFileSelected ? 'coloredButton' : ''}`}
              onClick={handleSubmit}
              disabled={!isFileSelected || method === ''}
            >
              Parse
            </button>
          </div>
        </div>
        {loading && (
          <div className="loading-spinner">
            <div className="spinner-border" style={{ width: '6rem', height: '6rem', marginTop: '150px', marginLeft:'50%' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {!loading && error && !successMessage && <div className="alert alert-danger">{error}</div>}
        {!loading && successMessage && !error && <div className="alert alert-success">{successMessage}</div>}
        {!loading && (
          <CSSTransition in={showPreview} timeout={300} classNames="fade" unmountOnExit>
            <div className="parsed-data" style={{ maxHeight: '25rem', overflowY: 'scroll' }}>
              <div className="card p-3">
                <h3 className="text-center" style={{textDecoration: 'underline'}}>Candidate Details</h3>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2px' , }}>
  <div>
    <DataField label="Name" value={editedData.name} field="name" handleEdit={handleEdit} style={{ marginTop: '2px' }} />
  </div>
  <div>
    <DataField label="Email" value={editedData.email} field="email" handleEdit={handleEdit} style={{ marginTop: '2px' }} />
  </div>
</div>


                <div className="row">
                  <div className="col-md-12">
                    <DataField
                      label="Experience"
                      value={editedData.experience}
                      field="experience"
                      handleEdit={handleEdit}
                      isTextArea
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <DataField
                      label="Education"
                      value={editedData.education}
                      field="education"
                      handleEdit={handleEdit}
                      isTextArea
                    />
                  </div>
                </div>
                <SkillsSection skills={editedData.skills} handleEdit={handleEdit} handleRemoveSkill={handleRemoveSkill} />

                <div className="text-end">
                  {isSaving ? (
                    <button className="btn btn-outline-secondary me-2" disabled>
                      Saving...
                    </button>
                  ) : (
                    <button className="btn btn-outline-success btn-confirm-save" onClick={handleSave}>
                      Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CSSTransition>
        )}
      </div>
    </div>
  );
}

export default ResumeParserSection;
