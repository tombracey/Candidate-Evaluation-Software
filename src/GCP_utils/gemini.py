import os
from dotenv import load_dotenv
import json
from datetime import date
import google.generativeai as genai

def log_gemini_usage(num_requests):
    """Logs each Gemini API call into the JSON file, grouped by day"""

    gemini_usage = os.path.join(".", "data", "gemini_usage.json")

    with open(gemini_usage, "r") as f:
        try:
            usage_data = json.load(f)
        except:
            usage_data = {}

    today = str(date.today())
    usage_data[today] = usage_data.get(today, 0) + num_requests

    with open(gemini_usage, "w") as f:
        json.dump(usage_data, f, indent=2)


def gemini(prompt):
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    genai.configure(api_key=api_key)

    if not api_key:
        raise ValueError("API key not set.")

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text

"""
Gemini 2.0 Flash - Free Tier:
 - 15 requests per minute
 - 1,000,000 tokens per minute (input + output)
 - 200 requests per day
"""