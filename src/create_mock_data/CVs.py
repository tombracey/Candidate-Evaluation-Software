import random
from src.GCP_utils.gemini import gemini

def generate_mock_CVs(sector=None):
    quality_options = ["outstanding", "strong", "mediocre", "below average", "an unsuitable CV", "comically bad"]
    quality = random.choice(quality_options)
     
    prompt = f"Generate a random realistic mock CV, nothing else. Make it {quality}"

    if sector:
        prompt += ", and aimed at a role in the {sector} sector"

    CV = gemini(prompt)
    return CV

print(generate_mock_CVs())