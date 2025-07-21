import os
import json
import pandas as pd
from src.GCP_utils.gemini import gemini
from src.utils import pdf_to_text

def get_CVs():
    # for testing purposes
    CVs_path = './data/CVs'
    CVs = []

    for filename in os.listdir(CVs_path):
            filepath = os.path.join(CVs_path, filename)
            if filename.lower().endswith('pdf'):
                 text = pdf_to_text(filepath)
            else:
                with open(filepath, 'r', encoding='utf-8') as file:
                    text = file.read()
            CVs.append(text)
    return CVs

def evaluate(pool: list, role: str):
    """
    Args:
        pool: list of CVs as strings
        role: job title and description as a string
    """
    data = []
    for candidate in pool:
        prompt = f"""Candidate: {candidate}
        Evaluate this candidate for a {role} role.
        Return only a Python dict as a string, formatted like: {{name: <their name>, experience: <score/100>, qualifications: <score/100>, location: location}}
I       Post code preferred for location where possible. If location isn't stated, return the location value as None.
        Return nothing else."""
        
        raw_output = gemini(prompt)
        # string_output = raw_output[0]
        clean_output = raw_output.replace('```python\n', '').replace('\n```', '').strip()

        try:
            candidate_dict = json.loads(clean_output)
            data.append(candidate_dict)
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON")
            print(f"Raw Gemini output: {raw_output}")
            print(f"Cleaned string (attempted JSON parse): '{clean_output}'")
            print(f"Error details: {e}")

    df = pd.DataFrame(data)
    df.to_markdown('./data/output/CV_evaluation.md', index=False)

CVs = get_CVs()

evaluate(CVs, "junior data engineer")