from odfdo import Document

def convert_odf_to_text(path):
    doc = Document(path)
    return doc.get_formatted_text()

print(convert_odf_to_text('./data/CVs/andrew_bailey.odt'))