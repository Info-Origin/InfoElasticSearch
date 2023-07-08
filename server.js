const express = require('express');
const multer = require('multer');
const pdfjsLib = require('pdfjs-dist');
const cors = require('cors');
const { spawnSync } = require('child_process');
const app = express();
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const Sequelize = require('sequelize');
const { Client } = require('@elastic/elasticsearch');
const { extractName, extractSkills, extractEmail, extractExperience, extractEducation } = require('./ParsingScripts/resume_parser');
const client = new Client({ node: 'http://localhost:9200' });
const indexName = 'resumes';

const sequelize = new Sequelize('RP', 'root', 'Mysql@123', {
  host: 'localhost',
  dialect: 'mysql',
  define: {
    timestamps: false
  }
});

const Resume = sequelize.define('resume', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  experience: Sequelize.TEXT,
  education: Sequelize.TEXT,
  skills: Sequelize.TEXT, // Skills are stored as a JSON string
  status: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
}, { tableName: 'resumes' });

sequelize.authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Resume parsing function for JavaScript method
const parseResumeJavaScript = async (resumeData) => {
  try {
    const doc = await pdfjsLib.getDocument(resumeData).promise;
    let resumeText = '';
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      resumeText += pageText + ' ';
    }

    const name = extractName(resumeText);
    const email = extractEmail(resumeText);
    const experience = extractExperience(resumeText);
    const education = extractEducation(resumeText);
    const skills = extractSkills(resumeText);

    return {
      name,
      email,
      experience,
      education,
      skills,
    };
  } catch (error) {
    console.log(error);
    throw new Error('Error parsing the resume.');
  }
};

// Resume parsing function for NLP method
// Resume parsing function for NLP method
const parseResumeNLP = async (resumeData) => {
  try {
    const resumeDataArray = new Uint8Array(resumeData);
    const doc = await pdfjsLib.getDocument(resumeDataArray).promise;
    let resumeText = '';
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      resumeText += pageText + ' ';
    }

    console.log('Resume Text:', resumeText); // Log the resume text

    const pythonProcess = spawnSync('python', ['./ParsingScripts/resume_parser.py', resumeText]);

    if (pythonProcess.error) {
      console.error(pythonProcess.error);
      throw new Error('Error parsing the resume.');
    }

    const stdout = pythonProcess.stdout.toString().trim();
    console.log('Python Script Output:', stdout); // Log the output of the Python script

    // Parse the Python script's output
    const [name, email, experience, education, ...skills] = stdout.split('\n').filter(Boolean);

    const parsedData = {
      name,
      email,
      experience,
      education,
      skills,
    };

    console.log('Parsed Data:', parsedData); // Log the parsed data

    return parsedData;
  } catch (error) {
    console.log(error);
    throw new Error('Error parsing the resume.');
  }
};


app.post('/upload', upload.single('resume'), async (req, res) => {
  const resumePath = req.file.path;
  const resumeData = new Uint8Array(fs.readFileSync(resumePath));

  const method = req.body.method;

  try {
    let parsedData;
    if (method === 'javascript') {
      parsedData = await parseResumeJavaScript(resumeData);
    } else if (method === 'nlp') {
      parsedData = await parseResumeNLP(resumeData);
    } else {
      res.status(400).json({ error: 'Invalid parsing method.' });
      return;
    }

    res.json(parsedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/save', (req, res) => {
  const { name, email, experience, education, skills } = req.body;

  // Check if "id" is present in the request body
  if (req.body.id) {
    Resume.findOne({ where: { id: req.body.id } })
      .then(existingResume => {
        if (existingResume) {
          // If a resume with the same id already exists, update the existing record
          existingResume.update({ name, experience, education, skills: JSON.stringify(skills) })
            .then(updatedResume => {
              res.json({ message: 'Data updated successfully.' });
            })
            .catch(error => {
              console.error(error);
              res.status(500).json({ error: 'An error occurred while updating the data.' });
            });
        } else {
          res.status(404).json({ error: 'No resume found with the given id.' });
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while retrieving the data.' });
      });
  } else {
    // If "id" is not present, create a new record
    Resume.create({ name, email, experience, education, skills: JSON.stringify(skills) })
      .then(newResume => {
        res.json({ message: 'Data saved successfully.' });
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while saving the data.' });
      });
  }
});

app.delete('/resumes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRows = await Resume.destroy({ where: { id } });

    if (deletedRows === 0) {
      res.status(404).json({ message: 'No resume found with the given id.' });
    } else {
      res.json({ message: 'Resume deleted successfully.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the resume.' });
  }
});

app.put('/resumes/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, experience, education, skills, status } = req.body;

  try {
    const existingResume = await Resume.findByPk(id);

    if (!existingResume) {
      res.status(404).json({ message: 'No resume found with the given id.' });
      return;
    }

    await existingResume.update({ name, email, experience, education, skills: JSON.stringify(skills), status });

    res.json({ message: 'Resume updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the resume.' });
  }
});

app.post('/sync', async (req, res) => {
  try {
    // Retrieve data from the database
    const resumes = await Resume.findAll({ raw: true });

    const localResumeIds = resumes.map(resume => resume.id);

    const bulkBody = [];

    // Prepare the bulk indexing requests
    for (const resume of resumes) {
      const { id, name, email, experience, education, skills, status } = resume;

      // Remove unwanted characters from the skills field
      const sanitizedSkills = skills.replace(/["'\\/\[\]]/g, '');

      try {
        const { body } = await client.get({
          index: indexName,
          id: `${id}`,
        });

        // Check if the resume already exists in Elasticsearch
        if (!body || !body._source) {
          // If not found, create a new entry
          bulkBody.push({ index: { _index: indexName, _id: `${id}` } });
          bulkBody.push({ id, name, email, experience, education, skills: sanitizedSkills, status });
        } else {
          // If found, check for changes
          const existingResume = body._source;
          const hasChanges =
            existingResume.name !== name ||
            existingResume.email !== email ||
            existingResume.experience !== experience ||
            existingResume.education !== education ||
            JSON.stringify(existingResume.skills) !== JSON.stringify(sanitizedSkills) ||
            existingResume.status !== status; // Include the "status" field for change comparison

          if (hasChanges) {
            // If changes exist, update the existing entry
            bulkBody.push({ update: { _index: indexName, _id: `${id}` } });
            bulkBody.push({ doc: { id, name, email, experience, education, skills: sanitizedSkills, status }, doc_as_upsert: true });
          }
        }
      } catch (error) {
        // If document not found, create a new entry
        if (error.statusCode === 404) {
          bulkBody.push({ index: { _index: indexName, _id: `${id}` } });
          bulkBody.push({ id, name, email, experience, education, skills: sanitizedSkills, status });
        } else {
          console.error(`Error retrieving document with ID ${id} from Elasticsearch:`, error);
        }
      }
    }

    // Delete documents with missing IDs from Elasticsearch
    const { body } = await client.deleteByQuery({
      index: indexName,
      body: {
        query: {
          bool: {
            must_not: {
              terms: {
                _id: localResumeIds,
              },
            },
          },
        },
      },
    });

    if (body && body.deleted) {
      const deletedIds = body.deleted.map(doc => doc._id);
      for (const deletedId of deletedIds) {
        bulkBody.push({ delete: { _index: indexName, _id: deletedId } });
      }
    }

    // Perform the bulk indexing and deletion
    if (bulkBody.length > 0) {
      await client.bulk({ body: bulkBody });
      res.json({ message: 'Data synced to Elasticsearch successfully.' });
    } else {
      res.json({ message: 'No changes detected. Data is up to date in Elasticsearch.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while syncing data to Elasticsearch.' });
  }
});



// Fetch data from the database
app.get('/fetch', (req, res) => {
  Resume.findAll()
    .then(resumes => {
      res.json(resumes);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching data from the database.' });
    });
});

// Elasticsearch search route
app.get('/search', async (req, res) => {
  try {
    const { q, filterType, shouldIncludeAllKeywords } = req.query;

    const body = {
      query: {
        bool: {
          must: [],
        },
      },
    };

    // Add filter conditions based on selected filter types
    if (Array.isArray(filterType) && filterType.length > 0) {
      body.query.bool.must.push({
        bool: {
          should: filterType.map(type => ({ term: { status: parseInt(type, 10) } })),
        },
      });
    }

    // Add fuzzy search conditions based on query string
    if (q) {
      const keywords = shouldIncludeAllKeywords ? q.split(' ') : [q];

      const shouldClause = {
        bool: {
          should: [],
        },
      };

      for (const keyword of keywords) {
        shouldClause.bool.should.push(
          { match: { name: { query: keyword, fuzziness: 'auto' } } },
          { match: { email: { query: keyword, fuzziness: 'auto' } } },
          { match: { experience: { query: keyword, fuzziness: 'auto' } } },
          { match: { education: { query: keyword, fuzziness: 'auto' } } },
          { match: { skills: { query: keyword, fuzziness: 'auto' } } }
        );
      }

      body.query.bool.must.push(shouldClause);
    }

    const { body: { hits } } = await client.search({ index: indexName, body });

    const results = hits.hits.map(hit => hit._source);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while searching data in Elasticsearch.' });
  }
});



app.listen(3000, () => {
  console.log('Server started on port 3000');
});
