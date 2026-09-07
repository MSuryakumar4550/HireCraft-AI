def calculate_keyword_score(resume_text, required_skills):
    """
    Checks if required skills exist in the resume.
    Returns a score from 0.0 to 1.0 (0% to 100%).
    """
    # Convert resume text to lowercase for easier matching
    resume_lower = resume_text.lower()
    
    matched_skills = []
    missing_skills = []
    
    # Handle edge case where required_skills is somehow completely empty
    if len(required_skills) == 0:
        return {
            "score": 0.0,
            "matched": [],
            "missing": []
        }
        
    for skill in required_skills:
        # Check if the skill (lowercase) is in the resume
        if skill.lower() in resume_lower:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)
            
    score = len(matched_skills) / len(required_skills)
    
    return {
        "score": score,
        "matched": matched_skills,
        "missing": missing_skills
    }

# Let's test the logic!
if __name__ == "__main__":
    sample_resume = "I am a software engineer with 3 years of experience in Java, Spring Boot, and building REST APIs. I also know SQL."
    job_requirements = ["Java", "Spring Boot", "Docker", "AWS", "SQL"]
    
    result = calculate_keyword_score(sample_resume, job_requirements)
    
    print("--- KEYWORD MATCH RESULT ---")
    print(f"Final Score: {result['score'] * 100}%")
    print(f"Found Skills: {result['matched']}")
    print(f"Missing Skills: {result['missing']}")
