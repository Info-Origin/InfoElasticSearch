# Resume Processor For Recruiters
## Description
The web application presented in this project enables users to parse resumes while incorporating candidate search capabilities for potential recruiters.
## Features
Resume Parsing: Users have the option to upload PDF resumes and utilize either JavaScript parsing or NLP parsing techniques to extract relevant information. The parsed data can be modified before being saved to the database.

Resume Repository: Offers a comprehensive collection of stored resumes within the database. Users can conveniently update resume details directly through this application.

Skill-based Candidate Exploration: Empowers users to conduct targeted searches for candidates based on specific skill sets of interest.
## System Requirements
Python 3.10.5 and above
Elasticsearch 8.8.1
MySQL 8.0
## Getting Started
To run the project locally, follow these steps:
1) Clone the repository to your local machine.
2) Client-side Installation Install the below frontend dependencies by running the following command:
   `cd client`
   `npm install`.
3) Server-side Installation Install the required backend dependencies by running the following command:
   `cd backend`
   `npm install`.
## Basic Steps for Running
Replace the placeholders for credentials with your credentials (Mysql credentials in server.js and also replace the elasticsearch index in server.js).
1) Start the Elasticsearch server and make sure it is running.
2) Start the MySQL service and ensure it is running.
3) Open a terminal or command prompt.
4) Navigate to the backend directory.
5) Run the server side using the following command:
   `nodemon index.js`.
6) Navigate to the frontend directory and run the following command:
   `npm start`        
![image](https://github.com/Info-Origin/InfoElasticSearch/assets/60666045/154c3ec6-080a-42b3-a854-7d29871c5103)

## Note :
1) While editing the data for a candidate after searching for a skill make sure you press 'Enter' after editing the respective detail.
   e.g once you edit the name, press Enter after editing. Then if you want to edit an email, press enter after editing it. And then press the save button altogether to save both edits at once.



