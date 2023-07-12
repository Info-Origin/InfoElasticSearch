
# Resume Parser

## Overview

Resume Parser is a fully functional resume parser application with integrated searching capabilities. It consists of multiple apps designed to streamline the resume parsing and candidate search processes.

## Features

* Resume Parser: Users can upload PDF resumes and parse them using JavaScript parsing or NLP parsing methods. The parsed data can be edited before saving it to the database.
* Resume Database: Provides a list of all stored resumes in the database. Users can update resume information directly from this app.
* Candidate Search: Enables users to search for candidates based on desired skills and other fields such as education, experience, etc.

## System Requirements

* Python 3.11 and above
* Elasticsearch 8.8.1
* MySQL 8.0

## Installation

1. Download the zip file of the application.
2. Extract the contents of the zip file.
3. Open a terminal or command prompt and navigate to the project directory.

### Server-side Installation


npm install express multer pdfjs-dist cors sequelize @elastic/elasticsearch
```

### Client-side Installation
```
cd client
npm install react bootstrap axios @mui/material/typeface-roboto @mui/material/AppBar @mui/material/Toolbar @mui/material/Typography @mui/material/Button @mui/material/Container @mui/material/Box @mui/material/CircularProgress
```

### NLP Parsing Installation

```
pip install spacy
python -m spacy download en_core_web_sm
```

### JS Parsing Installation

```
npm install natural
```

## Basic Steps for Running

1. Start Elasticsearch service and make sure it is running.
2. Start the MySQL service and ensure it is running.
3. Open a terminal or command prompt.
4. Navigate to the project directory.
5. Run the server-side using the following command:

```
node server.js
```

6. Open another terminal or command prompt.
7. Navigate to the client directory.
8. Run the client-side using the following command:

```
npm start


9. Access the application through the provided URL or local development server.

## Architecture

The Resume Parser application follows a client-server architecture. The server-side is built with Node.js using the Express framework, while the client-side is built with React. The server-side handles the resume parsing, database interactions, and integration with Elasticsearch. The client-side provides the user interface for uploading resumes, searching candidates, and managing the resume database.

The resume parsing functionality includes two methods: JavaScript parsing and NLP parsing. JavaScript parsing utilizes the natural module for extracting information from resume text, while NLP parsing uses the spacy library in Python.

The parsed resume data is stored in a MySQL database and indexed in Elasticsearch for efficient searching. The client-side communicates with the server-side using RESTful APIs.

