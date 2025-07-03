import google.generativeai as genai

def gemini(prompt):
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text

"""
Gemini 2.0 Flash - Free Tier:
 - 15 requests per minute
 - 1,000,000 tokens per minute (input + output)
 - 200 requests per day
"""