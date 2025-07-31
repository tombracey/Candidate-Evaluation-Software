import pytesseract

from PIL import Image

def image_to_text(path):
    img = Image.open(path)

    # Run OCR using pytesseract
    text = pytesseract.image_to_string(img)

    return text.strip()