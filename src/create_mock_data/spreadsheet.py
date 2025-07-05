import random
import csv
import pandas as pd
from faker import Faker

# Creates mock candidate CSVs and employer data

fake = Faker()

def get_postcodes(n, filepath="data/postcode_sample.csv"):
    df = pd.read_csv(filepath)
    
    sample = df.sample(n=n)
    return sample['pcd'].tolist()

def generate_candidates(num):
    candidates_names = [fake.name() for _ in range(num)]
    candidates_postcodes = get_postcodes(num)
    experience = [random.randint(2, 10) for _ in range(num)]
    qualifications = [random.randint(2, 10) for _ in range(num)]

    candidates = zip(candidates_names, candidates_postcodes, experience, qualifications)

    with open('data/mock_candidates.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Name', 'Postcode', 'Experience/10', 'Qualifications/10'])
        writer.writerows(candidates)

def generate_employer():
    employer_name = fake.company()
    employer_postcode = get_postcodes(1)[0]
    return employer_name, employer_postcode