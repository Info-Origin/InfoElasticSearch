import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import { TextField, Button, Card, CardContent, CardHeader } from '@mui/material';
import { updateResume, deleteResume } from './utils/api';

const SearchCandidatesSection = () => {
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    name: false,
    email: false,
    education: false,
    experience: false,
    skills: false,
    includeAllKeywords: false,
  });
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editedResult, setEditedResult] = useState(null);
  const [searchClicked, setSearchClicked] = useState(false);
  const [selectedAutosuggestIndex, setSelectedAutosuggestIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);

  const handleAutosuggestKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedAutosuggestIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedAutosuggestIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedAutosuggestIndex !== -1) {
        setSearchInput(suggestions[selectedAutosuggestIndex]);
        setSelectedAutosuggestIndex(-1); 
      }
    } else if (e.key === 'Backspace') {
      if (searchInput === '') {
        setSuggestions([]); 
      }
    }
  };
  

  const handleSearch = (event) => {
    event.preventDefault();
  
    const keywords = searchInput.split(',').map((keyword) => keyword.trim());
  
    const selectedFilters = Object.keys(filters).filter((filter) => filters[filter]);
  
    const query = {
      query: {
        bool: {
          must: [],
        },
      },
    };
  
    if (filters.includeAllKeywords) {
      const subQuery = {
        bool: {
          must: [],
        },
      };
  
      keywords.forEach((keyword) => {
        const subSubQuery = {
          bool: {
            should: [],
            minimum_should_match: 1,
          },
        };
  
        selectedFilters.forEach((filter) => {
          subSubQuery.bool.should.push({
            match: {
              [filter]: {
                query: keyword,
                fuzziness: 'auto',
              },
            },
          });
        });
  
        subQuery.bool.must.push(subSubQuery);
      });
  
      query.query.bool.must.push(subQuery);
    } else {
      keywords.forEach((keyword) => {
        const subQuery = {
          bool: {
            should: [],
            minimum_should_match: 1,
          },
        };
  
        selectedFilters.forEach((filter) => {
          subQuery.bool.should.push({
            match: {
              [filter]: {
                query: keyword,
                fuzziness: 'auto',
              },
            },
          });
        });
  
        query.query.bool.must.push(subQuery);
      });
    }
  
    axios
      .post('http://localhost:9200/resumes/_search', query)
      .then((response) => {
        setSearchResults(response.data.hits.hits);
        setSuggestions([]);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  
    setSearchClicked(true);
  };
  
  
  

  const handleFilterChange = (filter) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filter]: !prevFilters[filter],
    }));
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleEditResume = (resumeId) => {
    const editedResult = searchResults.find((result) => result._id === resumeId);
    if (editedResult) {
      setEditedResult({ ...editedResult });
    }
  };

  const handleSaveResume = () => {
    if (editedResult) {
      console.log('Saving resume:', editedResult);
      updateResume(editedResult._id, editedResult._source)
        .then((response) => {
          console.log('Resume updated successfully:', response.data);
          const updatedResults = searchResults.map((result) => {
            if (result._id === editedResult._id) {
              return {
                ...result,
                _source: {
                  ...result._source,
                  name: editedResult._source.name,
                  email: editedResult._source.email,
                  experience: editedResult._source.experience,
                  education: editedResult._source.education,
                  skills: editedResult._source.skills,
                  status: 1,
                },
              };
            }
            return result;
          });
          setSearchResults(updatedResults);
          setEditedResult(null);
        })
        .catch((error) => {
          console.error('Error updating resume:', error);
        });
    }
  };

  const handleDeleteResume = (resumeId) => {
    console.log('Deleting resume:', resumeId);
    deleteResume(resumeId)
      .then((response) => {
        console.log('Resume deleted successfully:', response.data);
        const updatedResults = searchResults.filter((result) => result._id !== resumeId);
        setSearchResults(updatedResults);
      })
      .catch((error) => {
        console.error('Error deleting resume:', error);
      });
  };

  const handleCancelEdit = () => {
    setEditedResult(null);
  };

  useEffect(() => {
    
    if (
      typeof searchInput === 'string' &&
      searchInput.trim() !== '' &&
      (Object.values(filters).some((filter) => filter))
    ) {
      const selectedFilters = Object.keys(filters).filter((filter) => filters[filter]);
  
    
      const commaIndex = searchInput.indexOf(',');
      const hasComma = commaIndex !== -1;
  
      
      const resetSuggestions = hasComma ? searchInput.substring(commaIndex + 1).trim() : searchInput.trim();
  
      const query = {
        query: {
          bool: {
            should: [], 
            minimum_should_match: 1, 
          },
        },
      };
  
      
      selectedFilters.forEach((filter) => {
        if (filter === 'skills') {
          const skills = resetSuggestions.split(',').map((skill) => skill.trim());
          skills.forEach((skill) => {
            query.query.bool.should.push({
              match_phrase_prefix: {
                [filter]: skill,
              },
            });
          });
        } else if (filter === 'name' || filter === 'email') {
          const subQuery = {
            match_phrase_prefix: {
              [filter]: resetSuggestions,
            },
          };
          query.query.bool.should.push(subQuery);
        } else {
          const subQuery = {
            match: {
              [filter]: {
                query: resetSuggestions,
                fuzziness: 'auto',
                prefix_length: 0,
              },
            },
          };
          query.query.bool.should.push(subQuery);
        }
      });
  
      axios
        .post('http://localhost:9200/resumes/_search', query)
        .then((response) => {
        
          const hits = response.data.hits.hits;
          const suggestionKeywords = {};
  
          hits.forEach((hit) => {
            selectedFilters.forEach((filter) => {
              if (filter === 'skills') {
                const skills = hit._source.skills.split(',').map((skill) => skill.trim());
                skills.forEach((skill) => {
                  if (skill.toLowerCase().startsWith(resetSuggestions.toLowerCase())) {
                    if (!suggestionKeywords[filter]) {
                      suggestionKeywords[filter] = new Set();
                    }
                    suggestionKeywords[filter].add(skill);
                  }
                });
              } else if (filter === 'name') {
                const name = hit._source[filter];
                if (name.toLowerCase().startsWith(resetSuggestions.toLowerCase())) {
                  if (!suggestionKeywords[filter]) {
                    suggestionKeywords[filter] = new Set();
                  }
                  suggestionKeywords[filter].add(name);
                }
              } else {
                const fieldValue = hit._source[filter];
                if (fieldValue.toLowerCase().includes(resetSuggestions.toLowerCase())) {
                  if (!suggestionKeywords[filter]) {
                    suggestionKeywords[filter] = new Set();
                  }
                  suggestionKeywords[filter].add(fieldValue);
                }
              }
            });
          });
  
          const sortedSuggestions = [];
  
          selectedFilters.forEach((filter) => {
            if (suggestionKeywords[filter]) {
              sortedSuggestions.push(
                <div
                  key={filter}
                  style={{
                    fontWeight: 'bold',
                    fontSize: '1.2em',
                    backgroundColor: '#f0f0f0',
                    padding: '4px',
                    marginTop: '8px',
                  }}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </div>
              );
              sortedSuggestions.push(...Array.from(suggestionKeywords[filter]).sort());
            }
          });
  
          setSuggestions(sortedSuggestions);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  }, [searchInput, filters]);
  
  

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="search-section" style={{ maxWidth: '1000px', textAlign: 'center' }}>
        <form onSubmit={handleSearch}>
        <div className="form-group">
  <TextField
    type="text"
    label="Enter a keyword"
    value={searchInput}
    onChange={(e) => setSearchInput(e.target.value)}
    fullWidth
    onKeyDown={handleAutosuggestKeyDown}
    InputProps={{
      autoComplete: 'off',
    }}
  />
    {suggestions.length > 0 && (
    <div className="suggestion-container" style={{maxHeight: '100px', overflow: 'auto', backgroundColor: 'rgba(0, 0, 0, 0.1)'}}>
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          onClick={() => setSearchInput(suggestion)}
          className="suggestion-item"
        >
          {suggestion}
        </div>
      ))}
    </div>
  )}

</div>






          <div className="filters-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <Typography variant="body1" className="filter font-weight-bold" style={{ marginRight: '10px' }}>
              Filter by:
           </Typography>
            {Object.keys(filters).map((filter) => (
              <div className="form-check form-check-inline" key={filter}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`${filter}Filter`}
                  checked={filters[filter]}
                  onChange={() => handleFilterChange(filter)}
                />
                <label className="form-check-label" htmlFor={`${filter}Filter`}>
                  {filter === 'includeAllKeywords' ? (
                    <b>{filter.charAt(0).toUpperCase() + filter.slice(1)}</b>
                  ) : (
                    filter.charAt(0).toUpperCase() + filter.slice(1)
                  )}
                </label>
              </div>
            ))}
          </div>

          <div className="form-group">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={Object.values(filters).every((filter) => !filter)}
            >
              Search
            </Button>
            <Button
              type="button"
              variant="contained"
              color="secondary"
              style={{ marginLeft: '15px' }}
              onClick={() => setSearchResults([])}
            >
              Clear
            </Button>
          </div>
        </form>

        <hr />

        {searchClicked && (
          <Typography variant="h6" component="h6" style={{ textAlign: 'center' }}>
            Total Results: {searchResults.length}
          </Typography>
        )}

        <div className="search-results-container" style={{ maxHeight: '500px', overflowY: 'auto', textAlign: 'left' }}>
          {searchResults.map((result) => (
            <Card key={result._id} className="candidate" style={{ marginBottom: '20px', textAlign: 'center', border: '1px solid #ccc', position: 'relative' }}>
              {editedResult && editedResult._id === result._id ? (
                <React.Fragment>
                  <CardContent>
                    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', marginBottom: '10px' }}>
                        <TextField
                          label="Name"
                          value={editedResult._source.name}
                          onChange={(e) =>
                            setEditedResult((prevResult) => ({
                              ...prevResult,
                              _source: {
                                ...prevResult._source,
                                name: e.target.value,
                              },
                            }))
                          }
                          style={{ marginRight: '10px' }}
                        />
                        <TextField
                          label="Email"
                          value={editedResult._source.email}
                          onChange={(e) =>
                            setEditedResult((prevResult) => ({
                              ...prevResult,
                              _source: {
                                ...prevResult._source,
                                email: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <TextField
                        label="Experience"
                        value={editedResult._source.experience}
                        onChange={(e) =>
                          setEditedResult((prevResult) => ({
                            ...prevResult,
                            _source: {
                              ...prevResult._source,
                              experience: e.target.value,
                            },
                          }))
                        }
                        multiline
                        rows={4}
                        fullWidth
                        style={{ marginBottom: '10px' }}
                      />
                      <TextField
                        label="Education"
                        value={editedResult._source.education}
                        onChange={(e) =>
                          setEditedResult((prevResult) => ({
                            ...prevResult,
                            _source: {
                              ...prevResult._source,
                              education: e.target.value,
                            },
                          }))
                        }
                        multiline
                        rows={4}
                        fullWidth
                        style={{ marginBottom: '10px' }}
                      />
                      <TextField
                        label="Skills"
                        value={editedResult._source.skills}
                        onChange={(e) =>
                          setEditedResult((prevResult) => ({
                            ...prevResult,
                            _source: {
                              ...prevResult._source,
                              skills: e.target.value,
                            },
                          }))
                        }
                        fullWidth
                        style={{ marginBottom: '10px' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button variant="contained" color="primary" onClick={handleSaveResume} style={{ marginRight: '10px' }}>
                          Save
                        </Button>
                        <Button variant="contained" color="secondary" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <CardHeader
                    title={
                      <Typography variant="h4" component="h3" style={{ fontWeight: 'bold' }}>
                        {result._source.name}
                      </Typography>
                    }
                    subheader={<Typography variant="h6">{result._source.email}</Typography>}
                    action={
                      <div>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleEditResume(result._id)}
                          style={{ position: 'absolute', top: 10, right: '90px', margin: '8px' }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDeleteResume(result._id)}
                          style={{ position: 'absolute', top: 10, right: '0px', margin: '8px' }}
                        >
                          Delete
                        </Button>
                        {result._source.status === 1 && (!editedResult || (editedResult && editedResult._id !== result._id)) ? (
                          <Button
                            variant="contained"
                            color="secondary"
                            size="small"  style={{
                              position: 'absolute',
                              top: '10px',
                              left: '10px',
                              fontWeight: 'bold',
                              fontSize: '12px',
                              textTransform: 'none',
                            }}
                          >
                            Edited
                          </Button>
                        ) : null}
                      </div>
                    }
                  />

                  <hr />
                  <CardContent>
                    <Typography variant="h5" style={{ textAlign: 'center' }}>
                      Education
                    </Typography>
                    <br />
                    <Typography variant="body1" style={{ textAlign: 'center' }}>
                      {result._source.education}
                    </Typography>
                    <br />
                    <Typography variant="h5" style={{ textAlign: 'center' }}>
                      Experience
                    </Typography>
                    <br />
                    <Typography variant="body1" style={{ textAlign: 'center' }}>
                      {result._source.experience}
                    </Typography>
                    <br />
                    <Typography variant="h5" style={{ textAlign: 'center' }}>
                      Skills
                    </Typography>
                    <br />
                    {result._source.skills &&
                      result._source.skills
                        .replace(/["'\\/\[\]]/g, '') // Remove all occurrences of ", ', \, /, [, and ]
                        .split(',')
                        .map((skill) => (
                          <Chip key={skill.trim()} label={skill.trim()} variant="outlined" style={{ margin: '2px' }} />
                        ))}
                  </CardContent>
                </React.Fragment>
              )}
            </Card>
          ))}
        </div>

        {searchResults.length > 5 && (
          <Pagination
            count={Math.ceil(searchResults.length / 5)}
            page={currentPage}
            onChange={handlePageChange}
            shape="rounded"
            style={{ marginTop: '20px', marginLeft: '40%' }}
          />
        )}
      </div>
    </div>
  );
};

export default SearchCandidatesSection;