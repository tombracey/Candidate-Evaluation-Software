import os
import json
import math
import pandas as pd
from src.utils.gemini import gemini, log_gemini_usage
from src.utils.maps import get_distance_or_duration, log_google_maps_usage
from src.utils.convert_to_text import convert_to_text

def evaluate_batch(pool: list, role: str, location: bool=True, description: str=None):
    """Evaluates a batch of up to 10 CVs with a single Gemini request"""
    pool_text = []
    for candidate in pool:
        candidate = convert_to_text(candidate)
        pool_text.append(candidate)

    candidates_block = "\n\n".join(
        [f"CANDIDATE {i+1}:\n{txt}\n" for i, txt in enumerate(pool_text)]
    )

    prompt = f"Evaluate the following {len(pool)} candidates for a {role} role."
    
    if description:
        prompt += f" Job Description: {description}."

    prompt +=f"""    
    {candidates_block}

    Return only a JSON object, formatted like: """
    
    if location:
        prompt += """[
            {
                "Name": "Jane Doe",
                "Experience": 85,
                "Qualifications": 75,
                "Location": "W7 1HP"
            },
            {
                "Name": "John Doe",
                "Experience": 40,
                "Qualifications": 45,
                "Location": null
            }
            ]
            Post codes are preferred, but return any location value given.
            If location isn't stated, use null."""
    else:
        prompt += """[
            {
                "Name": "Jane Doe",
                "Experience": 85,
                "Qualifications": 75
            },
            {
                "Name": "John Doe",
                "Experience": 40,
                "Qualifications": 45            }
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


def evaluate_all_CVs(pool: list, role: str, location=True, description: str=None, cv_employer_address=None):
    """
    Splits CVs into batches, evaluates them and aggregates the results.
    Returns results as a JSON string.
    """
    num_of_requests = math.ceil(len(pool)/ 10)
    log_gemini_usage(num_of_requests)

    all_results = []

    for i in range(0, len(pool), 10):
        batch = pool[i:i+10]

        batch_results = evaluate_batch(batch, role, location, description)
        if batch_results is not None:
            all_results.append(batch_results)

    results_df = pd.concat(all_results, ignore_index=True)
    results_df["Overall Suitability"] = ((results_df["Experience"] + results_df["Qualifications"]) / 2).round(0).astype(int)

    if cv_employer_address:
        travel_times = []
        requests = 0
        for candidate_address in results_df["Location"]:
            requests += 1
            try:
                travel_time = get_distance_or_duration(candidate_address, cv_employer_address)
                travel_times.append(travel_time)
            except:
                travel_times.append(None)
        log_google_maps_usage(requests)

        results_df['Travel Time (mins)'] = travel_times
        
        
        travel_normalised = 1 - ((results_df['Travel Time (mins)'] -20).clip(0, 100) / 100).fillna(0)

        # Recalculates 'Overall Suitability' column to include travel time (35% weight):
        results_df['Overall Suitability'] = ((results_df['Overall Suitability'] * 0.65) + (travel_normalised * 100 * 0.35)).round(0).astype(int)  
        # Adds the column to the end again:
        columns = [col for col in results_df.columns if col != "Overall Suitability"] + ["Overall Suitability"]
        results_df = results_df[columns]

    results_df = results_df.sort_values(by="Overall Suitability", ascending=False)
    results_df.to_markdown('./data/output/CV_evaluation.md', index=False)
    result_json = results_df.to_json(orient='records', indent=4)
    return result_json


def get_CV_paths():
    # (for testing purposes)
    CVs_path = './data/CVs'
    CVs = []

    for filename in os.listdir(CVs_path):
            filepath = os.path.join(CVs_path, filename)
            CVs.append(filepath)
    return CVs