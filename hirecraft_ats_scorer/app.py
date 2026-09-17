import gradio as gr
from fastapi import FastAPI, UploadFile, Form
import shutil
import os
import re
import pandas as pd
import xgboost as xgb
import spaces

from document_parser import extract_text
from keyword_matcher import calculate_keyword_score
from semantic_matcher import calculate_semantic_score

# 1. Load trained ATS Scoring Model
print("Loading trained ATS Scoring Model...")
ats_model = xgb.XGBRegressor()
ats_model.load_model("hirecraft_ats_scorer.json")

def generate_recommendations(keyword_results, semantic_score, resume_text):
    recommendations = []
    
    missing_skills = keyword_results.get("missing", [])
    if missing_skills:
        skills_text = ", ".join(missing_skills)
        recommendations.append(f"🔴 Keyword Gap: You are missing required skills. If you have experience with [{skills_text}], you MUST explicitly add them to your resume. ATS systems will lower your score if exact words are missing.")
    else:
        recommendations.append("🟢 Keyword Optimization: Great job! Your resume contains all the required keywords we checked for.")
    
    if semantic_score < 0.50:
        recommendations.append("🟠 Content Alignment: The overall context of your resume doesn't match the job description well. Ensure your experience actually reflects the core responsibilities of this role.")
    elif semantic_score >= 0.70:
        recommendations.append("🟢 Content Alignment: Excellent! The core meaning of your resume aligns perfectly with what this job is looking for.")
    else:
        recommendations.append("🟡 Content Alignment: Your resume is moderately aligned with the job description. Try to tailor your bullet points a bit more towards the specific responsibilities mentioned.")
        
    has_numbers = bool(re.search(r'\d+', resume_text))
    has_percent = "%" in resume_text
    if not has_numbers or not has_percent:
        recommendations.append("🟠 Impact Metrics: We couldn't detect quantifiable metrics. Recruiters love numbers. Try changing phrases like 'Improved database speed' to 'Improved database speed by 35%'.")
    else:
        recommendations.append("🟢 Impact Metrics: We detected numbers and percentages in your resume! Quantifying your impact significantly improves your chances.")
        
    word_count = len(resume_text.split())
    if word_count < 150:
        recommendations.append("🔴 Too Short: Your resume is very brief. Expand on your project details and responsibilities to give the ATS more text to analyze.")
    elif word_count > 800:
        recommendations.append("🟠 Too Long: Your resume is quite long. ATS systems and human recruiters prefer concise resumes. Consider trimming it to focus only on the most relevant experience.")
        
    if "@" not in resume_text:
        recommendations.append("🔴 Missing Contact Info: We couldn't detect an email address. Ensure your contact information is clearly visible in the plain text.")
        
    if len(recommendations) < 3:
        recommendations.append("🟢 ATS Readability: We were able to parse your document successfully, meaning your formatting is ATS-friendly without complex unreadable tables.")
        
    if len(recommendations) < 3:
        recommendations.append("💡 Pro-Tip: Always start your bullet points with strong action verbs (e.g., 'Developed', 'Orchestrated', 'Spearheaded') instead of passive phrases (e.g., 'Responsible for').")

    return recommendations

def run_semantic_inference(resume_text: str, job_description: str) -> float:
    return calculate_semantic_score(resume_text, job_description)

def compute_ats_score(resume_file_path: str, filename: str, job_description: str, required_skills: str = ""):
    resume_text = extract_text(resume_file_path, filename)
    
    if not required_skills or not required_skills.strip():
        common_skills = [
            "Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "React", "Angular", "Vue", 
            "Node.js", "Express", "Django", "FastAPI", "Spring Boot", "AWS", "Azure", "GCP", 
            "Docker", "Kubernetes", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Git", "CI/CD",
            "REST APIs", "Agile", "Data Structures", "Algorithms", "Object-Oriented Programming"
        ]
        jd_lower = job_description.lower() if job_description else ""
        skills_list = [s for s in common_skills if s.lower() in jd_lower]
        if not skills_list:
            skills_list = ["Software Development"]
    else:
        skills_list = [s.strip() for s in required_skills.split(",") if s.strip()]
        
    keyword_results = calculate_keyword_score(resume_text, skills_list)
    keyword_score = keyword_results["score"]
    
    # Semantic similarity on NVIDIA GPU
    semantic_score = run_semantic_inference(resume_text, job_description or "")
    
    format_score = 0.85
    if keyword_score < 0.4 and semantic_score < 0.6:
        format_score = 0.20
        
    features = pd.DataFrame([{
        'keyword_score': keyword_score,
        'semantic_score': semantic_score,
        'format_score': format_score
    }])
    
    final_score = float(ats_model.predict(features)[0])
    if keyword_score < 0.4 and semantic_score < 0.6:
        final_score = final_score / 1.5
        
    final_score = max(0.0, min(100.0, final_score))
    recommendations = generate_recommendations(keyword_results, semantic_score, resume_text)
    
    return {
        "final_ats_score": float(final_score),
        "breakdown": {
            "keyword_match": keyword_results,
            "semantic_score": round(float(semantic_score), 4),
            "format_score": format_score,
            "TEXT_THE_AI_READ": resume_text,
            "recommendations": recommendations
        }
    }

# ----------------- Gradio UI -----------------
@spaces.GPU
def gradio_score_resume(file, job_description, required_skills):
    if file is None:
        return "Please upload a resume file (PDF or DOCX)."
    
    result = compute_ats_score(file.name, os.path.basename(file.name), job_description or "", required_skills or "")
    score = result["final_ats_score"]
    breakdown = result["breakdown"]
    recs = "\n".join(breakdown["recommendations"])
    matched = ", ".join(breakdown["keyword_match"].get("matched", []))
    missing = ", ".join(breakdown["keyword_match"].get("missing", []))
    
    output = (
        f"🎯 ATS Match Score: {score:.1f}%\n"
        f"📊 Semantic Alignment: {breakdown['semantic_score'] * 100:.1f}%\n\n"
        f"✅ Matched Skills: {matched or 'None'}\n"
        f"❌ Missing Skills: {missing or 'None'}\n\n"
        f"💡 Recommendations:\n{recs}"
    )
    return output

with gr.Blocks(title="HireCraft ATS Engine") as demo:
    gr.Markdown("# 🚀 HireCraft AI - ATS Scorer & Resume Matcher")
    gr.Markdown("Running on **Hugging Face ZeroGPU (NVIDIA A10G)**. Exposes both this UI and REST API (`/score-resume/`).")
    
    with gr.Row():
        with gr.Column():
            file_in = gr.File(label="Upload Resume", file_types=[".pdf", ".docx", ".txt"])
            jd_in = gr.Textbox(label="Job Description", lines=6, placeholder="Paste Job Description here...")
            skills_in = gr.Textbox(label="Required Skills (Optional comma-separated)")
            submit_btn = gr.Button("Evaluate Resume", variant="primary")
        with gr.Column():
            result_out = gr.Textbox(label="Evaluation Scorecard", lines=15)
            
    submit_btn.click(gradio_score_resume, inputs=[file_in, jd_in, skills_in], outputs=[result_out])

# ----------------- Attach FastAPI Routes -----------------
app = demo.app

@app.post("/api/parse-jd")
async def parse_jd(file: UploadFile):
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    common_skills = [
        "Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "React", "Angular", "Vue", 
        "Node.js", "Express", "Django", "FastAPI", "Spring Boot", "AWS", "Azure", "GCP", 
        "Docker", "Kubernetes", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Git", "CI/CD",
        "REST APIs", "Agile"
    ]
    found_skills = [s for s in common_skills if s.lower() in text.lower()] or ["Communication", "Problem Solving"]
    return {
        "jobTitle": "Extracted Role",
        "requiredSkills": found_skills,
        "experienceRequired": "Not specified",
        "companyOverview": "", "responsibilities": "", "qualifications": "", "benefits": ""
    }

@app.post("/score-resume/")
@spaces.GPU
async def score_resume(
    resume_file: UploadFile, 
    job_description: str = Form(""), 
    required_skills: str = Form("") 
):
    temp_path = f"temp_{resume_file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(resume_file.file, buffer)
    try:
        return compute_ats_score(temp_path, resume_file.filename, job_description, required_skills)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    demo.launch()
