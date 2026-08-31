import docx
from pypdf import PdfReader

def extract_text_from_docx(file_path):
    try:
        doc = docx.Document(file_path)
        return "\n".join([p.text.strip() for p in doc.paragraphs if p.text.strip()])
    except Exception as e:
        return f"Error reading DOCX: {e}"

def extract_text_from_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        full_text = []
        for page in reader.pages:
            full_text.append(page.extract_text())
        return "\n".join(full_text)
    except Exception as e:
        return f"Error reading PDF: {e}"

def extract_text(file_path, filename):
    """Smart function that checks the file type and uses the right parser"""
    if filename.lower().endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    else:
        return extract_text_from_docx(file_path)
