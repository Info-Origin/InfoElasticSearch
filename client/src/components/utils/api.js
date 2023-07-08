import axios from 'axios';

export const uploadResume = (formData) => {
  return axios.post('http://localhost:3000/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const saveData = (editedData) => {
  return axios.post('http://localhost:3000/save', editedData);
};

export const updateResume = (id, data) => {
  console.log('Updating resume:', id, data); // Log the resume ID and data before making the request

  // Set the status field to 1 in the data object
  const updatedData = {
    ...data,
    status: 1,
  };

  return axios
    .put(`http://localhost:3000/resumes/${id}`, updatedData)
    .then((response) => {
      console.log('Resume update response:', response.data); // Log the response data
      return response;
    })
    .catch((error) => {
      console.error('Error updating resume:', error);
      throw error;
    });
};

export const deleteResume = (id) => {
  console.log('Deleting resume:', id); // Log the resume ID before making the request

  return axios
    .delete(`http://localhost:3000/resumes/${id}`)
    .then((response) => {
      console.log('Resume deleted successfully:', response.data); // Log the response data
      return response;
    })
    .catch((error) => {
      console.error('Error deleting resume:', error);
      throw error;
    });
};
