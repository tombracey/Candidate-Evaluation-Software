import os
from dotenv import load_dotenv
import google.generativeai as genai

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