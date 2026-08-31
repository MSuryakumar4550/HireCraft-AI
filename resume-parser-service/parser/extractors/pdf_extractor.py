import pymupdf  # PyMuPDF

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a standard PDF."""
    try:
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        raise Exception(f"Failed to read PDF: {str(e)}")
