import spacy
import sys
import re
from SkillsList.skills import skills_keywords 


nlp = spacy.load('en_core_web_sm')

def extract_name(resume_text):
    doc = nlp(resume_text)
    for ent in doc.ents:
        if ent.label_ == 'PERSON':
            return ent.text
    return ''

import re

def extract_skills(resume_text):
    skills = []
    unique_skills = set()

    # Convert the resume text to lowercase for case-insensitive matching
    resume_text_lower = resume_text.lower()

    for keyword in skills_keywords:
        keyword_lower = keyword.lower()
        if keyword_lower in resume_text_lower:
            unique_skills.add(keyword_lower)

    return list(unique_skills)


def extract_email(resume_text):
    regex = r'[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    matches = re.findall(regex, resume_text)
    return matches[0] if matches else ''

def extract_experience(resume_text):
    experience_keywords = ['experience', 'employment history', 'work experience', 'professional experience', 'profile']
    experience_section = ''

    for keyword in experience_keywords:
        start_index = resume_text.lower().find(keyword)
        if start_index != -1:
            experience_section = resume_text[start_index + len(keyword):]
            break

    education_index = experience_section.lower().find('education')
    if education_index != -1:
        experience_section = experience_section[:education_index]

    # Remove leading and trailing whitespace
    experience_section = experience_section.strip()

    return experience_section


def extract_education(resume_text):
    education_keywords = ['education', 'academic qualifications']
    education_section = ''

    for keyword in education_keywords:
        start_index = resume_text.lower().find(keyword)
        if start_index != -1:
            education_section = resume_text[start_index + len(keyword):]
            break

    # Remove leading and trailing whitespace
    education_section = education_section.strip()

    return education_section



if __name__ == '__main__':
    resume_text = sys.argv[1]
    name = extract_name(resume_text)
    skills = extract_skills(resume_text)
    email = extract_email(resume_text)
    experience = extract_experience(resume_text)
    education = extract_education(resume_text)

    # Print the extracted data
    print(name)
    print(email)
    print(experience)
    print(education)

    # Print the skills
    for skill in skills:
        print(skill)
