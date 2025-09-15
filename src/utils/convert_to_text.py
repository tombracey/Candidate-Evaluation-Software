from src.utils.conversions.pdf import pdf_to_text
from src.utils.conversions.word import word_to_text
from src.utils.conversions.image import image_to_text
from src.utils.conversions.odt import convert_odf_to_text

def convert_to_text(path):
    """
    Used to convert CVs to text before parsing into Gemini
    """
    path_lower = path.lower()
    if path_lower.endswith('.pdf'):
        return pdf_to_text(path)
    elif path_lower.endswith('.docx') or path_lower.endswith('.doc'):
        return word_to_text(path)
    elif path_lower.endswith('.txt'):
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    elif path_lower.endswith('.odt'):
        return convert_odf_to_text(path)
    elif path_lower.endswith('.jpg') or path_lower.endswith('.png'):
        return image_to_text(path)
    else:
        print("Could not parse file type")