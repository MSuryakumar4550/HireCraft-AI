from pydantic import BaseModel
from typing import List
from schema.resume import ParsedResume

class SuggestionsRequest(BaseModel):
    parsed_resume: ParsedResume
    missing_skills: List[str]
    job_title: str

class SuggestionsResponse(BaseModel):
    problems: List[str]
    suggestions: List[str]
