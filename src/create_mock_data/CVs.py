import random
from datetime import datetime
import pandas as pd
from faker import Faker
from src.GCP_utils.gemini import gemini

def generate_mock_CVs(num=1, role=None):
    fake = Faker()
    
    quality_options = ["outstanding", "strong", "mediocre", "below average", "an unsuitable CV", "comically bad"]
    
    for _ in range(num):
        name = fake.name()
        quality = random.choice(quality_options)
        postcode = pd.read_csv("data/postcode_sample.csv").sample(1).iloc[0, 0]
        print(name, postcode, quality)
        # Gemini can't reliably generate a variety of names or real addresses

        prompt = f"Generate a random realistic mock CV for {name}, who lives at {postcode}. Invent a realistic UK phone number, email address, and a real but random university name or secondary school name. Also, invent realistic names for companies and job roles. Make it {quality}"
        # I had to be very specific or it would leave placeholders

        if role:
            prompt += f", and aimed at a {role} role"

        prompt += "Don't return anything but the CV content!"

        CV = gemini(prompt)
        save_path = f"./data/CVs/{datetime.now()}.txt"
        with open(save_path, 'w') as f:
            f.write(CV)

generate_mock_CVs(3, "Junior Data Engineer")