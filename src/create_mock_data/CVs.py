import random
from datetime import datetime
from src.GCP_utils.gemini import gemini

def generate_mock_CVs(num=1, role=None):
    quality_options = ["outstanding", "strong", "mediocre", "below average", "an unsuitable CV", "comically bad"]
    
    for _ in range(num):
        quality = random.choice(quality_options)
        print(quality)

        prompt = f"Generate a random realistic mock CV. Invent a believable, full fake name, a realistic UK phone number, a plausible email address, a made-up but realistic UK street address with a city and postcode, a convincing university name, college name, and secondary school name. Also, invent realistic names for companies and job roles. Make it {quality}"
        # I had to be very specific or it would leave placeholders

        if role:
            prompt += f", and aimed at a {role} role"

        prompt += "Don't return anything but the CV content!"

        CV = gemini(prompt)
        save_path = f"./data/CVs/{datetime.now()}.txt"
        with open(save_path, 'w') as f:
            f.write(CV)

generate_mock_CVs(10, "Junior Data Engineer")