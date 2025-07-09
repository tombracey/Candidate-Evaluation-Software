import os
import pandas as pd
from src.GCP_utils.gemini import gemini

def get_CVs():
    CVs_path = './data/CVs'
    CVs = []

    for filename in os.listdir(CVs_path):
            filepath = os.path.join(CVs_path, filename)
            with open(filepath, 'r', encoding='utf-8') as file:
                text = file.read()
                CVs.append(text)
    return CVs

def evaluate(pool, role):
    data = []
    for candidate in pool:
        prompt = f"""Candidate: {candidate}
        Evaluate this candidate for a {role} role.
        Return only a Python dict as a string, formatted like: {{name: <their name>, experience: <score/100>, qualifications: <score/100>, location: location}}
I       If location isn't stated, return the location value as None.
        Return nothing else.
        Do not include any other text, code blocks or formatting."""
        data.append(gemini(prompt))
    print(data)

CVs = get_CVs()

evaluate(CVs, "junior data engineer")