import google.generativeai as genai
import os

def gemini(prompt):
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text

print(gemini("how do u do"))