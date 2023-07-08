const natural = require('natural');
const skills_keywords = require('./skillsList/skills');

  
  const experience_keywords = ['experience', 'employment history', 'work experience', 'professional experience' , 'profile'];
  const education_keywords = ['education', 'academic qualifications'];
  
  function extractName(resume_text) {
    const tokenizer = new natural.WordTokenizer();
    const words = tokenizer.tokenize(resume_text);
    return words.slice(0, 2).join(' ');  // Assumes the first two words are the name
  }
  
  function extractSkills(resume_text) {
    const skills = [];
    const uniqueSkills = new Set();
  
    const resume_text_lower = resume_text.toLowerCase();
  
    for (const keyword of skills_keywords) {
      const keyword_lower = keyword.toLowerCase();
      if (resume_text_lower.includes(keyword_lower)) {
        uniqueSkills.add(keyword_lower);
      }
    }
  
    return Array.from(uniqueSkills);
  }
  
  
  
  
  
  
  
  
  function extractEmail(resume_text) {
    const regex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = resume_text.match(regex);
    return matches ? matches[0] : '';
  }
  
  function extractExperience(resume_text) {
    let experience_section = '';
  
    for (const keyword of experience_keywords) {
      const regex = new RegExp('\\b' + keyword + '\\b', 'i');
      const match = regex.exec(resume_text);
      if (match) {
        experience_section = resume_text.substring(match.index + keyword.length);
        break;
      }
    }
  
    const education_index = experience_section.toLowerCase().indexOf('education');
    if (education_index !== -1) {
      experience_section = experience_section.substring(0, education_index);
    }
  
    return experience_section.trim();
  }
  
  function extractEducation(resume_text) {
    let education_section = '';
  
    for (const keyword of education_keywords) {
      const regex = new RegExp('\\b' + keyword + '\\b', 'i');
      const match = regex.exec(resume_text);
      if (match) {
        education_section = resume_text.substring(match.index + keyword.length);
        break;
      }
    }
  
    return education_section.trim();
  }
  
  module.exports = {
    extractName,
    extractSkills,
    extractEmail,
    extractExperience,
    extractEducation
  };
  