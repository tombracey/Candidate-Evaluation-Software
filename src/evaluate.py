import os
import json
import pandas as pd
from src.GCP_utils.gemini import gemini
from src.conversions.pdf import pdf_to_text
from src.conversions.word import word_to_text
from src.conversions.image import image_to_text

def convert_to_text(path):
    """
    Used to convert CVs to text before parsing into Gemini
    """
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
    """Evaluates a batch of up to 10 CVs with a single Gemini request"""
    pool_text = []
    for candidate in pool:
        candidate = convert_to_text(candidate)
        pool_text.append(candidate)

    candidates_block = "\n\n".join(
        [f"CANDIDATE {i+1}:\n{txt}" for i, txt in enumerate(pool_text)]
    )

    prompt = f"""
    Evaluate the following {len(pool)} candidates for a {role} role.
    
    {candidates_block}

    Return only a JSON object, formatted like: """
    
    if location:
        prompt += """[
            {
                "name": "Tom Bracey",
                "experience": 90,
                "qualifications": 90,
                "location": "W7 1HP"
            },
            {
                "name": "John Doe",
                "experience": 80,
                "qualifications": 85,
                "location": null
            }
            ]
            Post codes are preferred, but return any location value given.
            If location isn't stated, use null."""
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

    prompt += "\nAll values must be valid JSON, return no extra text."
    
    raw_output = gemini(prompt)
    clean_output = (
        raw_output
        .replace('```json', '')
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
    return df


def evaluate_all_CVs(pool: list, role: str, location=True):
    """
    Splits CVs into batches and evaluates each batch.
    Aggregates results into one dataframe.
    """
    all_results = []

    for i in range(0, len(pool), 10):
        batch = pool[i:i+10]

        results_df = evaluate_batch(batch, role, location)
        if results_df is not None:
            all_results.append(results_df)

    final_df = pd.concat(all_results, ignore_index=True)
    final_df["Overall Suitability"] = ((final_df["experience"] + final_df["qualifications"]) / 2).round(0).astype(int)
    final_df = final_df.sort_values(by="Overall Suitability", ascending=False)
    final_df.to_markdown('./data/output/CV_evaluation.md', index=False)
    return final_df

CVs = get_CV_paths()

evaluate_all_CVs(CVs, "junior data engineer")