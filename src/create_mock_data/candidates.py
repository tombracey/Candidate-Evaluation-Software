import random
import csv
import pandas as pd
from faker import Faker

fake = Faker()

def get_postcodes(n, filepath="data/postcode_sample.csv"):
    df = pd.read_csv(filepath)
    
    sample = df.sample(n=n)
    return sample['pcd'].tolist()