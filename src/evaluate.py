import os
import json
import pandas as pd
from src.GCP_utils.gemini import gemini
from src.conversions.pdf import pdf_to_text
from src.conversions.word import word_to_text
from src.conversions.image import image_to_text

def convert_to_text(path):
    path_lower = path.lower()
    if path_lower.endswith('.pdf'):
        return pdf_to_text(path)
    elif path_lower.endswith('.docx') or path_lower.endswith('.doc'):
        return word_to_text(path)
    elif path_lower.endswith('.txt'):
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    elif path_lower.endswith('.odt'):
        pass
    elif path_lower.endswith('.jpg') or path_lower.endswith('.png'):
        return image_to_text(path)
    else:
        print("Could not parse file type")

def get_CV_paths():
    # for testing purposes
    CVs_path = './data/CVs'
    CVs = []

    for filename in os.listdir(CVs_path):
            filepath = os.path.join(CVs_path, filename)
            # if filename.lower().endswith('pdf'):
            #      text = pdf_to_text(filepath)
            # else:
            #     with open(filepath, 'r', encoding='utf-8') as file:
            #         text = file.read()
            CVs.append(filepath)
    return CVs

def evaluate(pool: list, role: str, location=True):
    """
    Args:
        pool: list of CVs as strings
        role: job title and description as a string
    """
    data = []
    for candidate in pool:
        candidate = convert_to_text(candidate)

        prompt = f"""Candidate: "{candidate}"
        Evaluate this candidate for a {role} role.
        Return only a Python dict as a string, formatted like: """
        
        if location:
             prompt += """{{name: <their name>, experience: <score/100>, qualifications: <score/100>, location: location}}
I       Post code preferred for location where possible. If location isn't stated, return the location value as None."""
        else:
             prompt += "{{name: <their name>, experience: <score/100>, qualifications: <score/100>}}"
        
        prompt += "Return nothing else."
        
        raw_output = gemini(prompt)
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

CVs = get_CV_paths()
print(CVs)

evaluate(CVs, "junior data engineer")