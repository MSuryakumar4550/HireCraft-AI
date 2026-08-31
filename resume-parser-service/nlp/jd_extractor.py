import json
import os
import google.generativeai as genai
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def extract_jd_entities(text: str) -> Dict[str, Any]:
    """Extract job description details using Gemini API."""
    
    json_schema = {
        "job_title": "string",
        "required_skills": ["string"],
        "experience_required": "string",
        "company_overview": "string",
        "responsibilities": ["string"],
        "qualifications": ["string"],
        "benefits": ["string"]
    }
    
    prompt = f"""
    You are an expert HR parser. Your task is to extract key information from the following Job Description (JD) text and format it EXACTLY according to the provided JSON schema.
    
    JD TEXT:
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
        print(f"Error during Gemini JD extraction: {e}")
        # Fallback empty structure
        return {
            "job_title": "Unknown Title",
            "required_skills": [],
            "experience_required": "Not specified",
            "company_overview": None,
            "responsibilities": [],
            "qualifications": [],
            "benefits": []
        }
