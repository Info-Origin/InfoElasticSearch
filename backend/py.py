





import nltk
import sys
nltk.download('stopwords')

from pyresparser import ResumeParser
import json
# pip install nltk

# pip install spacy==2.3.5

# pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-2.3.1/en_core_web_sm-2.3.1.tar.gz

# pip install pyresparser

data = ResumeParser(sys.argv[1]).get_extracted_data()
data

print(json.dumps(data))