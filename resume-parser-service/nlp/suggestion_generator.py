from networkx.algorithms.connectivity import edge_augmentation
import json
import ollama
import google.generativeai as genai
from typing import Dict, Any

def generate_suggestions(resume_data: dict, missing_skills: list, job_title: str) -> Dict[str, Any]:
    """Generate ATS recommendations using Ollama LLM based on resume and missing skills."""
    
    # Define the expected schema to guide the LLM
    json_schema = {
        "problems": ["string (e.g. 'Your summary is too brief', 'You are missing key skills')"],
        "suggestions": ["string (e.g. 'Add 3 sentences to your summary', 'Include Python in your experience section')"],
        "improvement_suggestions": ["string"],
        "critical_issues": ["string"],
        "overall_feedback": "string"
    }
    
    prompt = f"""
    You are an expert Career Coach and ATS Consultant. Based on the following extracted resume data and missing skills for the target role of '{job_title}', generate actionable suggestions.
    
    RESUME DATA:
    {json.dumps(resume_data, indent=2)}
    
    MISSING SKILLS (Compared to JD):
    {', '.join(missing_skills) if missing_skills else 'None'}
    
    EXPECTED JSON SCHEMA:
    {json.dumps(json_schema, indent=2)}
    
    Respond ONLY with valid JSON matching this schema. Focus on actionable advice for the candidate to improve their ATS match rate.
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
        print(f"Error during Gemini suggestions generation: {e}")
        # Fallback
        return {
            "problems": ["Unable to generate problems due to LLM error."],
            "suggestions": ["Please review your resume manually."],
            "improvement_suggestions": ["Ensure your resume includes more measurable metrics."],
            "critical_issues": ["Failed to generate deep insights due to LLM error."],
            "overall_feedback": "Please manually review your resume against the JD."
        }
