from fastapi import FastAPI, UploadFile, File, HTTPException
from schema.resume import ParsedResume
from schema.jd import ParsedJd
from schema.suggestions import SuggestionsRequest, SuggestionsResponse
from parser.extractors.pdf_extractor import extract_text_from_pdf
from parser.extractors.docx_extractor import extract_text_from_docx
from nlp.cleaner import clean_text
from nlp.ner_extractor import extract_entities
from nlp.jd_extractor import extract_jd_entities
from nlp.suggestion_generator import generate_suggestions
import uvicorn

app = FastAPI(title="Resume Parser Service", version="1.0")

@app.post("/api/parse-resume", response_model=ParsedResume)
async def parse_resume(file: UploadFile = File(...)):
    """Upload a PDF or DOCX resume and return structured JSON."""
    
    file_bytes = await file.read()
    filename = file.filename.lower()
    
    try:
        # 1. File Type Detection and Extraction
        raw_text = ""
        if filename.endswith(".pdf"):
            raw_text = extract_text_from_pdf(file_bytes)
        elif filename.endswith(".docx"):
            raw_text = extract_text_from_docx(file_bytes)
        elif filename.endswith(".txt"):
            raw_text = file_bytes.decode('utf-8', errors='ignore')
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Only PDF, DOCX, and TXT are allowed.")
            
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the document.")
            
        # 2. Text Cleaning
        cleaned_text = clean_text(raw_text)
        
        # 3. NLP Extraction
        structured_data = extract_entities(cleaned_text)
        
        # 4. Return as Validated JSON (Pydantic handles validation against ParsedResume schema)
        return structured_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/parse-jd", response_model=ParsedJd)
async def parse_jd(file: UploadFile = File(...)):
    """Upload a PDF or DOCX Job Description and return structured JSON."""
    
    file_bytes = await file.read()
    filename = file.filename.lower()
    
    try:
        # 1. File Type Detection and Extraction
        raw_text = ""
        if filename.endswith(".pdf"):
            raw_text = extract_text_from_pdf(file_bytes)
        elif filename.endswith(".docx"):
            raw_text = extract_text_from_docx(file_bytes)
        elif filename.endswith(".txt"):
            raw_text = file_bytes.decode('utf-8', errors='ignore')
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Only PDF, DOCX, and TXT are allowed.")
            
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the document.")
            
        # 2. Text Cleaning
        cleaned_text = clean_text(raw_text)
        
        # 3. NLP Extraction
        structured_data = extract_jd_entities(cleaned_text)
        
        # 4. Return as Validated JSON
        return structured_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/suggestions", response_model=SuggestionsResponse)
async def get_suggestions(request: SuggestionsRequest):
    """Generate ATS recommendations using LLM."""
    try:
        suggestions = generate_suggestions(
            resume_data=request.parsed_resume.model_dump(), 
            missing_skills=request.missing_skills, 
            job_title=request.job_title
        )
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
