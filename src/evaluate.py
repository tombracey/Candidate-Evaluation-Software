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
            CVs.append(filepath)
    return CVs

def evaluate_batch(pool: list, role: str, location=True):
    """
    
    """
    pool_text = []
    for candidate in pool:
        candidate = convert_to_text(candidate)
        pool_text.append(candidate)

    candidates_block = "'\n\n'".join(pool_text)

    prompt = f"""
    Evaluate the followiong {len(pool)} candidates for a {role} role.
    
    {candidates_block}

    Return only a JSON object, formatted like: """
    
    if location:
        prompt += """[
            {
                "name": "Tom Bracey",
                "experience": 90,
                "qualifications": 90,
                "location": "Ealing"
            },
            {
                "name": "John Doe",
                "experience": 80,
                "qualifications": 85,
                "location": null
            }
            ]
            If location isn't stated, use null for the location value."""
    else:
        prompt += """[
            {
                "name": "Tom Bracey",
                "experience": 90,
                "qualifications": 90
            },
            {
                "name": "John Doe",
                "experience": 80,
                "qualifications": 85            }
            ]
        """

    prompt += "\nAll values must be valid JSON. Use null instead of None. Return only JSON, no extra text."
    
    raw_output = gemini(prompt)
    clean_output = (
        raw_output
        .replace('```json', '')
        .replace('```python', '')
        .replace('```', '')
        .strip()
    )

    try:
        evaluations = json.loads(clean_output)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON")
        print(f"Raw Gemini output: {raw_output}")
        print(f"Cleaned string (attempted JSON parse): '{clean_output}'")
        print(f"Error details: {e}")

    df = pd.DataFrame(evaluations)
    df.to_markdown('./data/output/CV_evaluation_5.md', index=False)

CVs = get_CV_paths()

evaluate_batch(CVs, "junior data engineer")