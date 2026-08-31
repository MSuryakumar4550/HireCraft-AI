from pydantic import BaseModel
from typing import List, Optional

class ParsedJd(BaseModel):
    job_title: str
    required_skills: List[str] = []
    experience_required: Optional[str] = None
    company_overview: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    qualifications: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
