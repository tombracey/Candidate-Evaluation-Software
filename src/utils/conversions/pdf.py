import pdfplumber
import pytesseract
from pdf2image import convert_from_path

pdf_path = "./data/CVs/tom.pdf"

def pdf_to_text(path):
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text += page.extract_text()
    # pdfplumber converts text-based CVs

    if len(text) < 20:
        # falls back on converting to image and then text with OCR
        text = ""
        images = convert_from_path(path)
        for img in images:
            text += pytesseract.image_to_string(img)

    return text