from pydantic import BaseModel
from typing import List, Optional

class Contact(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None

class Experience(BaseModel):
    company: str
    job_title: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: List[str] = []

class Education(BaseModel):
    institution: str
    degree: str
    graduation_year: Optional[str] = None

class Project(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: List[str] = []

class ParsedResume(BaseModel):
    contact: Optional[Contact] = None
    summary: Optional[str] = None
    skills: List[str] = []
    education: List[Education] = []
    experience: List[Experience] = []
    projects: List[Project] = []
    certifications: List[str] = []
    achievements: List[str] = []
