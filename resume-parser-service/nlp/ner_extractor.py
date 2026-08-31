import json
import os
import google.generativeai as genai
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def extract_entities(text: str) -> Dict[str, Any]:
    """Extract entities like email, phone, skills, etc. using Gemini API."""
    
    # Define the expected schema to guide the LLM
    json_schema = {
        "contact": {
            "email": "string",
            "phone": "string",
            "linkedin": "string",
            "github": "string"
        },
        "summary": "string (a brief professional summary)",
        "skills": ["string (list of technical or soft skills)"],
        "education": [
            {
                "institution": "string",
                "degree": "string",
                "graduation_year": "string"
            }
        ],
        "experience": [
            {
                "company": "string",
                "job_title": "string",
                "start_date": "string",
                "end_date": "string",
                "description": ["string (list of bullet points)"]
            }
        ],
        "projects": [
            {
                "name": "string",
                "description": "string",
                "technologies": ["string"]
            }
        ],
        "certifications": ["string"],
        "achievements": ["string"]
    }
    
    prompt = f"""
    You are an expert resume parser. Your task is to extract information from the following resume text and format it EXACTLY according to the provided JSON schema.
    
    RESUME TEXT:
    {text}
    
    EXPECTED JSON SCHEMA:
    {json.dumps(json_schema, indent=2)}
    
    Respond ONLY with valid JSON matching this schema. Do not include any explanations, markdown formatting blocks, or extra text.
    """
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        
        result = json.loads(response.text)
        return result
        
    except Exception as e:
        print(f"Error during Gemini extraction: {e}")
        # Fallback empty structure
        return {
            "contact": {"email": None, "phone": None, "linkedin": None, "github": None},
            "summary": None,
            "skills": [],
            "education": [],
            "experience": [],
            "projects": [],
            "certifications": [],
            "achievements": []
        }
