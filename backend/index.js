
// import express, { json } from 'express';
// import multer from 'multer';
// import pkg from 'pdfjs-dist';
// const { getDocument } = pkg;
// import cors from 'cors';
// import { spawnSync } from 'child_process';
// const app = express();
// const upload = multer({ dest: 'uploads/' });
// import { readFileSync } from 'fs';
// import Sequelize, { INTEGER, STRING, TEXT } from 'sequelize';

// // Initialize Sequelize to connect to the database
// const sequelize = new Sequelize('berykv7yt5f93hijqznf', 'uyk6frcwngbujhaq', 'uyk6frcwngbujhaq', {
//   host: 'localhost',
//   dialect: 'mysql',
//   define: {
//     timestamps: false
//   }
// });

// // Define a Sequelize model for our resume data
// const Resume = sequelize.define('Resume', {
//   id: {
//     type: INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   name: STRING,
//   email: STRING,
//   experience: TEXT,
//   education: TEXT,
// });

// // Connect to the database
// sequelize.authenticate()
//   .then(() => {
//     console.log('Connection to the database has been established successfully.');
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//   });

// app.use(json());
// app.use(cors({
//      methods: ['GET', 'POST', 'PUT', 'DELETE'],
//      origin: 'http://localhost:3000',
//   }));; // Enable CORS for all routes

// app.post('/upload', upload.single('file'), (req, res) => {
//   // Read the uploaded resume file
//   const resumePath = req.file.path;
//   const resumeData = readFileSync(resumePath);

//   // Parse the resume using pdf.js
//   getDocument(resumeData).promise.then(async (doc) => {
//     let resumeText = '';
//     for (let i = 1; i <= doc.numPages; i++) {
//       const page = await doc.getPage(i);
//       const content = await page.getTextContent();
//       const pageText = content.items.map(item => item.str).join(' ');
//       resumeText += pageText + ' ';
//     }

//     // Extract name and skills using Python script with spaCy
//     const [name, skills] = extractNameAndSkillsUsingPython(resumeText);

//     // Extract other information from resume text
//     const email = extractEmail(resumeText);
//     const experience = extractExperience(resumeText);
//     const education = extractEducation(resumeText);

//     // Send the parsed data as a response
//     res.json({
//       name,
//       email,
//       experience,
//       education,
//       skills,
//     });
//   }).catch((error) => {
//     console.log(error);
//     res.status(500).json({ error: 'Error parsing the resume.' });
//   });
// });


// app.post('/save', (req, res) => {
//   const { name, email, experience, education } = req.body;
//   // Save the edited data to the database
//   Resume.create({ name, email, experience, education })
//     .then(newResume => {
//       // Send the saved data as a response
//       res.json(newResume);
//     })
//     .catch(error => {
//       console.error(error);
//       res.status(500).json({ error: 'Error saving the resume to the database.' });
//     });
// });

// // Helper function to extract the name and skills using the Python script
// function extractNameAndSkillsUsingPython(resumeText) {
//   const pythonProcess = spawnSync('python', ['resume_parser.py', resumeText]);
//   const output = pythonProcess.stdout.toString().trim();
//   const lines = output.split('\n');
//   const name = lines[0].trim();
//   const skills = lines.slice(1).map(skill => skill.trim());

//   return [name, skills];
// }

// function extractEmail(resumeText) {
//   const regex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/; // Matches email addresses
//   const matches = resumeText.match(regex);
//   return matches ? matches[0] : '';
// }

// function extractExperience(resumeText) {
//   const experienceKeywords = ['experience', 'employment history', 'work experience', 'professional experience'];
//   let experienceSection = '';

//   for (const keyword of experienceKeywords) {
//     const startIndex = resumeText.toLowerCase().indexOf(keyword);
//     if (startIndex !== -1) {
//       experienceSection = resumeText.substring(startIndex);
//       break;
//     }
//   }

//   const educationIndex = experienceSection.toLowerCase().indexOf('education');
//   if (educationIndex !== -1) {
//     experienceSection = experienceSection.substring(0, educationIndex);
//   }

//   // Remove the "Employment History" from the experienceSection
//   experienceSection = experienceSection.replace(/employment history/gi, '');

//   // Insert a newline before each job
//   experienceSection = experienceSection.replace(/([A-Z\s]+\s[A-Z]{3,}\s\d{4}\s—)/g, '\n$1');

//   experienceSection = experienceSection.replace(/\*/g, '');
//   experienceSection = experienceSection.trim();

//   return experienceSection;
// }

// function extractEducation(resumeText) {
//   const educationKeywords = ['education', 'academic qualifications'];
//   let educationSection = '';

//   for (const keyword of educationKeywords) {
//     const startIndex = resumeText.toLowerCase().indexOf(keyword);
//     if (startIndex !== -1) {
//       educationSection = resumeText.substring(startIndex);
//       break;
//     }
//   }

//   // Remove the "Education" from the educationSection
//   educationSection = educationSection.replace(/education/gi, '');

//   // Insert a newline before each degree
//   educationSection = educationSection.replace(/([A-Z\s]+\s(degree|bachelor's|master's))/g, '\n$1');

//   educationSection = educationSection.replace(/\*/g, '');
//   educationSection = educationSection.trim();

//   return educationSection;
// }

// // Start the server
// app.listen(5000, () => {
//   console.log('Server is running on port 3000');
// });


import path from "path";
import express, { json, urlencoded } from "express";
import multer, { diskStorage } from "multer";
const app =express();
import request from "request";
import https from "https";
import PDFParser from 'pdf2json';
import ResumeParser from 'resume-parser';
import { PythonShell}  from 'python-shell';
import { spawn } from 'node:child_process';
import cors from "cors";
import fs from 'fs';
import PDFJS from 'pdfjs-dist';
import textract from 'textract';
import todos from './routes/todosRoutes.js';
// import { Client } from '@elastic/elasticsearch';
// const client = new Client({ node: 'http://localhost:9200' });

//const ResumeParser = require('resume-parser');

// Define the path to the resume fil


import { writeFileSync ,readFile} from "fs";

const PORT = 5000;
app.set("view engine","ejs");
app.use(json());
app.use(urlencoded({extended:false}));
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Authorization'],
  credentials: true
 
}));
app.use('/api', todos);

function extractResumeDetails(resumeText) {
  const details = {
    name: '',
    email: '',
    education: '',
    experience: '',
    skills: [],
  };

  // Extract name
  const nameRegex = /[A-Za-z]+\s[A-Za-z]+/;
  const nameMatch = resumeText.match(nameRegex);
  if (nameMatch) {
    details.name = nameMatch[0];
  }

  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  const emailMatch = resumeText.match(emailRegex);
  if (emailMatch) {
    details.email = emailMatch[0];
  }

  // Extract education
  const education_keywords = ['education', 'educational background', 'academic qualifications'];

  const educations = [];

  for (const keyword of education_keywords) {
      const startIndex = resumeText.toLowerCase().indexOf(keyword.toLowerCase());

if (startIndex !== -1) {
  const endIndex = resumeText.indexOf('\n\n', startIndex);
  const educationText = resumeText.slice(startIndex, endIndex !== -1 ? endIndex : undefined).trim();
  educations.push(educationText);
}
}

  if (educations.length > 0) {
details.education = educations;
}


  // Extract experience
  const experience_keywords = ['internship','projects','experience', 'employment history', 'work experience', 'professional experience', 'internships', 'job history', 'position of responsibility'];

  const experiences = [];
  
  for (const keyword of experience_keywords) {
    const startIndex = resumeText.toLowerCase().indexOf(keyword.toLowerCase());
    
    if (startIndex !== -1) {
      const endIndex = resumeText.indexOf('\n\n', startIndex);
      const experienceText = resumeText.slice(startIndex, endIndex !== -1 ? endIndex : undefined).trim();
      experiences.push(experienceText);
    }
  }
  
  if (experiences.length > 0) {
    details.experience = experiences;
  }




  // Extract skills
  const technicalSkillsKeywords = [
      'Python', 'C++', 'C', 'HTML', 'CSS', 'JavaScript', 'SQL',
      'React', 'Node.js', 'Bootstrap', 'jQuery', 'NumPy', 'Pandas', 'Scikit-Learn', 'Git',
       'Data Analysis','Web Development','Data Science','AWS','ETL','Angular','Google Ads','Digital Marketing',
      'DSA', 'Data Structures', 'Algorithms', 'Problem Solving', 'Competitive Programming', 'MS Excel', 'MS Word',
      'MS PowerPoint', 'MS Access', 'MySQL', 'MongoDB', 'PostgreSQL', 'SQLite', 'Oracle', 'NoSQL', 
      'Linux', 'Windows', 'MacOS', 'Android', 'iOS', 'Arduino', 'Raspberry Pi', 'Embedded Systems', 'Solidworks', 'LT-Spice',
      'ReactJS', 'MATLAB', 'Backend', 'Frontend'
      // Add more keywords here
    ];
    
    // Extracting skills based on predefined keywords
    const skills = technicalSkillsKeywords.filter(keyword => {
      const lowercaseKeyword = keyword.toLowerCase();
      return resumeText.toLowerCase().includes(lowercaseKeyword);
    });
    
    details.skills = skills;


  return details;
}

// Function to extract text from a PDF file
function extractTextFromPDF(filePath) {
  return new Promise((resolve, reject) => {
    // Read the PDF file as a buffer
    const dataBuffer = fs.readFileSync(filePath);

    // Load the PDF document
    PDFJS.getDocument(dataBuffer).promise.then((pdf) => {
      const numPages = pdf.numPages;
      const pagesText = [];

      // Extract text from each page
      for (let i = 1; i <= numPages; i++) {
        pdf.getPage(i).then((page) => {
          page.getTextContent().then((textContent) => {
            const pageText = textContent.items.map((item) => item.str).join(' ');
            pagesText.push(pageText);

            // Check if text extraction is complete
            if (pagesText.length === numPages) {
              resolve(pagesText.join('\n'));
            }
          });
        });
      }
    }).catch((error) => {
      reject(error);
    });
  });
}

// Function to convert PDF file to text using textract
function convertPDFToText(filePath) {
  return new Promise((resolve, reject) => {
    textract.fromFileWithPath(filePath, (error, text) => {
      if (error) {
        reject(error);
      } else {
        resolve(text);
      }
    });
  });
}

// const upload = multer({dest:"./uploads"});

app.get("/",(req,res) => {
    res.json(req.body);
})
const storage = diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() ;
      const fl = file.fieldname + '-' + uniqueSuffix;
      

return cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf')
    }
  })

  const upload = multer({storage })


app.post('/upload',upload.single('file'),(req,res) => {
  
   
   const fname = req.file.filename;
   
  


const pdfFilePath = './uploads/'+fname;



// Define the path to the resume file
const resumePath = pdfFilePath;
console.log(req.body.option);
// Call the ResumeParser to extract data from the 
if(req.body.option==='JS'){
  // console.log(req.body);

  
  // Function to extract text from a PDF file
  function extractTextFromPDF(filePath) {
    return new Promise((resolve, reject) => {
      // Read the PDF file as a buffer
      const dataBuffer = fs.readFileSync(filePath);
  
      // Load the PDF document
      PDFJS.getDocument(dataBuffer).promise.then((pdf) => {
        const numPages = pdf.numPages;
        const pagesText = [];
  
        // Extract text from each page
        for (let i = 1; i <= numPages; i++) {
          pdf.getPage(i).then((page) => {
            page.getTextContent().then((textContent) => {
              const pageText = textContent.items.map((item) => item.str).join(' ');
              pagesText.push(pageText);
  
              // Check if text extraction is complete
              if (pagesText.length === numPages) {
                resolve(pagesText.join('\n'));
              }
            });
          });
        }
      }).catch((error) => {
        reject(error);
      });
    });
  }
  
  // Function to convert PDF file to text using textract
  function convertPDFToText(filePath) {
    return new Promise((resolve, reject) => {
      textract.fromFileWithPath(filePath, (error, text) => {
        if (error) {
          reject(error);
        } else {
          resolve(text);
        }
      });
    });
  }
  
  // Usage example
  const pdfFilePath = resumePath;
  
  
  let text = ''
  convertPDFToText(pdfFilePath)
    .then((convertedText) => {
      console.log('Converted Text:');
      const resumeText = convertedText;
      //console.log(resumeText);
      const parsedResume = extractResumeDetails(resumeText);
      console.log(parsedResume);
      res.json(parsedResume);
  // Print extracted information
  
    })
    .catch((error) => {
      console.error('Error converting PDF to text:', error);
    });
  
}
if(req.body.option==='NLP'){
    // Access and 
console.log(req.body.option);
const py = spawn('python',['py.py',pdfFilePath]);
py.stdout.on('data',(data)=>{
  console.log(data.toString())
  res.json(data.toString());
})
py.on('close',(code)=>{
  console.log(`code exited with code ${code}`)
})
 let options = {
      scriptPath:"./",
      args:[pdfFilePath],
    }
}
  // if(req.body.option==='JS'){
  //   console.log(req.body.option);
  
    
  //   // Function to extract text from a PDF file
  //   function extractTextFromPDF(filePath) {
  //     return new Promise((resolve, reject) => {
  //       // Read the PDF file as a buffer
  //       const dataBuffer = fs.readFileSync(filePath);
    
  //       // Load the PDF document
  //       PDFJS.getDocument(dataBuffer).promise.then((pdf) => {
  //         const numPages = pdf.numPages;
  //         const pagesText = [];
    
  //         // Extract text from each page
  //         for (let i = 1; i <= numPages; i++) {
  //           pdf.getPage(i).then((page) => {
  //             page.getTextContent().then((textContent) => {
  //               const pageText = textContent.items.map((item) => item.str).join(' ');
  //               pagesText.push(pageText);
    
  //               // Check if text extraction is complete
  //               if (pagesText.length === numPages) {
  //                 resolve(pagesText.join('\n'));
  //               }
  //             });
  //           });
  //         }
  //       }).catch((error) => {
  //         reject(error);
  //       });
  //     });
  //   }
    
  //   // Function to convert PDF file to text using textract
  //   function convertPDFToText(filePath) {
  //     return new Promise((resolve, reject) => {
  //       textract.fromFileWithPath(filePath, (error, text) => {
  //         if (error) {
  //           reject(error);
  //         } else {
  //           resolve(text);
  //         }
  //       });
  //     });
  //   }
    
  //   // Usage example
  //   const pdfFilePath = resumePath;
    
    
  //   let text = ''
  //   convertPDFToText(pdfFilePath)
  //     .then((convertedText) => {
  //       console.log('Converted Text:');
  //       const resumeText = convertedText;
  //       //console.log(resumeText);
  //       const parsedResume = extractResumeDetails(resumeText);
  //       console.log(parsedResume);
    
  //   // Print extracted information
    
  //     })
  //     .catch((error) => {
  //       console.error('Error converting PDF to text:', error);
  //     });
    
  // }
//  PythonShell.run("server.py", options,(err,res)=>{
//       console.log("success");
//       if(err){
//         console.log(err);}
//       if(res){
//         const d = res ;
//         res.json(d);
//       }
//     })
     
    
        


          
  // res.redirect('http://localhost:3000');
})
app.listen(PORT,()=>{
    console.log("server started on 5000");
})

