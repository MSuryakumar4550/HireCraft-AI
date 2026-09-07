from fastapi import FastAPI, UploadFile, Form
import pickle
import pandas as pd
import uvicorn
import shutil
import os
import xgboost as xgb 
import re

# Import the logic we wrote in Phase 1 & 2
from document_parser import extract_text
from keyword_matcher import calculate_keyword_score
from semantic_matcher import calculate_semantic_score

app = FastAPI(title="HireCraft ATS Engine")

print("Loading your trained ATS Scoring Model...")
ats_model = xgb.XGBRegressor()
ats_model.load_model("hirecraft_ats_scorer.json")

# Place the recommendations function OUTSIDE the route
def generate_recommendations(keyword_results, semantic_score, resume_text):
    """Analyzes the resume text to provide professional ATS guidance"""
    recommendations = []
    
    # 1. Missing Keywords (The most critical ATS factor)
    missing_skills = keyword_results.get("missing", [])
    if missing_skills:
        skills_text = ", ".join(missing_skills)
        recommendations.append(f"🔴 Keyword Gap: You are missing required skills. If you have experience with [{skills_text}], you MUST explicitly add them to your resume. ATS systems will lower your score if exact words are missing.")
    else:
        recommendations.append("🟢 Keyword Optimization: Great job! Your resume contains all the required keywords we checked for.")
    
    # 2. Semantic / Context Alignment
    if semantic_score < 0.50:
        recommendations.append("🟠 Content Alignment: The overall context of your resume doesn't match the job description well. Ensure your experience actually reflects the core responsibilities of this role.")
    elif semantic_score >= 0.70:
        recommendations.append("🟢 Content Alignment: Excellent! The core meaning of your resume aligns perfectly with what this job is looking for.")
    else:
        recommendations.append("🟡 Content Alignment: Your resume is moderately aligned with the job description. Try to tailor your bullet points a bit more towards the specific responsibilities mentioned.")
        
    # 3. Quantifiable Metrics Check (Numbers and %)
    has_numbers = bool(re.search(r'\d+', resume_text))
    has_percent = "%" in resume_text
    if not has_numbers or not has_percent:
        recommendations.append("🟠 Impact Metrics: We couldn't detect quantifiable metrics. Recruiters love numbers. Try changing phrases like 'Improved database speed' to 'Improved database speed by 35%'.")
    else:
        recommendations.append("🟢 Impact Metrics: We detected numbers and percentages in your resume! Quantifying your impact significantly improves your chances.")
        
    # 4. Resume Length Check
    word_count = len(resume_text.split())
    if word_count < 150:
        recommendations.append("🔴 Too Short: Your resume is very brief. Expand on your project details and responsibilities to give the ATS more text to analyze.")
    elif word_count > 800:
        recommendations.append("🟠 Too Long: Your resume is quite long. ATS systems and human recruiters prefer concise resumes. Consider trimming it to focus only on the most relevant experience.")
        
    # 5. Contact Info Check
    if "@" not in resume_text:
        recommendations.append("🔴 Missing Contact Info: We couldn't detect an email address. Ensure your contact information is clearly visible in the plain text.")
        
    # 6. Fallbacks to guarantee at least 3-4 points of feedback
    if len(recommendations) < 3:
        recommendations.append("🟢 ATS Readability: We were able to parse your document successfully, meaning your formatting is ATS-friendly without complex unreadable tables.")
        
    if len(recommendations) < 3:
        recommendations.append("💡 Pro-Tip: Always start your bullet points with strong action verbs (e.g., 'Developed', 'Orchestrated', 'Spearheaded') instead of passive phrases (e.g., 'Responsible for').")

    return recommendations


@app.post("/api/parse-jd")
async def parse_jd(file: UploadFile):
    """Fallback endpoint for JD parsing to auto-extract skills."""
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    
    common_skills = [
        "Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "React", "Angular", "Vue", 
        "Node.js", "Express", "Django", "FastAPI", "Spring Boot", "AWS", "Azure", "GCP", 
        "Docker", "Kubernetes", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Git", "CI/CD",
        "REST APIs", "Agile"
    ]
    
    found_skills = []
    text_lower = text.lower()
    for skill in common_skills:
        if skill.lower() in text_lower:
            found_skills.append(skill)
            
    if not found_skills:
        found_skills = ["Communication", "Problem Solving"]
        
    return {
        "jobTitle": "Extracted Role",
        "requiredSkills": found_skills,
        "experienceRequired": "Not specified",
        "companyOverview": "",
        "responsibilities": "",
        "qualifications": "",
        "benefits": ""
    }

@app.post("/score-resume/")
async def score_resume(
    resume_file: UploadFile, 
    job_description: str = Form(""), 
    required_skills: str = Form("") 
):
    """API Endpoint to score a Resume against a Job Description"""
    
    # 1. Save uploaded file temporarily
    temp_path = f"temp_{resume_file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(resume_file.file, buffer)
        
    # 2. Extract Text using our parser
    resume_text = extract_text(temp_path, resume_file.filename)
    os.remove(temp_path) # Clean up the temp file
    
    # 3. Calculate Keyword Score
    if not required_skills.strip():
        # Auto-extract from JD if user didn't provide any
        common_skills = [
            "Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "React", "Angular", "Vue", 
            "Node.js", "Express", "Django", "FastAPI", "Spring Boot", "AWS", "Azure", "GCP", 
            "Docker", "Kubernetes", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Git", "CI/CD",
            "REST APIs", "Agile", "Data Structures", "Algorithms", "Object-Oriented Programming"
        ]
        jd_lower = job_description.lower()
        skills_list = [skill for skill in common_skills if skill.lower() in jd_lower]
        if not skills_list:
            skills_list = ["Software Development"] # Fallback
    else:
        # Clean up empty strings from the list
        skills_list = [s.strip() for s in required_skills.split(",") if s.strip()]
        
    keyword_results = calculate_keyword_score(resume_text, skills_list)
    keyword_score = keyword_results["score"]
    
    # 4. Calculate Semantic Score using Hugging Face
    semantic_score = calculate_semantic_score(resume_text, job_description)
    
    # 5. Format Score
    format_score = 0.85 
    
    # If the core content (keywords & semantics) is poor, formatting doesn't matter.
    if keyword_score < 0.4 and semantic_score < 0.6:
        format_score = 0.20 # Tank the format score so it doesn't artificially boost the model
    
    # 6. Predict Final ATS Score using the Colab Model!
    features = pd.DataFrame([{
        'keyword_score': keyword_score,
        'semantic_score': semantic_score,
        'format_score': format_score
    }])
    
    final_score = float(ats_model.predict(features)[0])
    
    # Apply strict penalty to final score if the core match is terrible
    if keyword_score < 0.4 and semantic_score < 0.6:
        final_score = final_score / 1.5
        
    # Cap between 0 and 100
    final_score = max(0.0, min(100.0, final_score))
    
    return {
        "final_ats_score": float(final_score),
        "breakdown": {
            "keyword_match": keyword_results,
            "semantic_score": round(float(semantic_score), 4),
            "format_score": format_score,
            "TEXT_THE_AI_READ": resume_text,
            
            # Here we pass all 3 variables into the function correctly!
            "recommendations": generate_recommendations(keyword_results, semantic_score, resume_text)
        }
    }

# Start the web server
if __name__ == "__main__":
    print("Starting HireCraft ATS Server...")
    uvicorn.run(app, host="127.0.0.1", port=8001)
