import re

def clean_text(raw_text: str) -> str:
    """Clean the raw text extracted from documents."""
    # Remove multiple spaces
    text = re.sub(r'\s+', ' ', raw_text)
    # Remove non-printable characters
    text = ''.join(char for char in text if char.isprintable())
    # Strip leading/trailing whitespaces
    return text.strip()
