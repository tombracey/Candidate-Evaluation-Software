import pytesseract
from PIL import Image

def image_to_text(path):
    img = Image.open(path)
    try:
        text = pytesseract.image_to_string(img)
        return text.strip()
    except:
        print("Unable to convert image to text")