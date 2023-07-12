from resume_parser import resumeparse
from pyresparser import ResumeParser
import json
import sys


import nltk

nltk.download('stopwords')

def main(d):
    data = resumeparse.read_file(d)
    #data = ResumeParser(d).get_extracted_data()
    print(json.dumps(data))
if __name__ =='__main__':
    x = 'backend/uploads/file-1686681141468.pdf'
    main(x)   
    # main(sys.argv[1])
    #D:\Internship\infoOrigin\resumeParser\backend\uploads\file-1686679993226.pdf