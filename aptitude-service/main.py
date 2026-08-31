from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql.expression import func
from sqlalchemy import String
from pydantic import BaseModel
import datetime
from typing import List, Optional

from database import engine, Base, get_db
import models

app = FastAPI(title="HireCraft AI Aptitude Service")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    # Create tables automatically on startup for development purposes
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)

class AnswerSubmission(BaseModel):
    user_id: str
    question_id: str
    question_type: str # "APTITUDE" or "CODING"
    is_correct: bool

@app.post("/submit_answer")
async def submit_answer(submission: AnswerSubmission, db: AsyncSession = Depends(get_db)):
    query = select(models.UserQuestionHistory).where(
        models.UserQuestionHistory.user_id == submission.user_id,
        models.UserQuestionHistory.question_id == submission.question_id,
        models.UserQuestionHistory.question_type == submission.question_type
    )
    result = await db.execute(query)
    existing_record = result.scalars().first()
    
    if existing_record:
        existing_record.is_correct = submission.is_correct
        existing_record.attempted_at = datetime.datetime.utcnow()
    else:
        new_record = models.UserQuestionHistory(
            user_id=submission.user_id,
            question_id=submission.question_id,
            question_type=submission.question_type,
            is_correct=submission.is_correct
        )
        db.add(new_record)
        
    await db.commit()
    return {"status": "success"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "aptitude-service"}

@app.get("/questions")
async def get_questions(topic: Optional[str] = None, user_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(models.Question)
    if topic:
        query = query.where(models.Question.topic == topic)
        
    if user_id:
        history_query = select(models.UserQuestionHistory.question_id).where(
            models.UserQuestionHistory.user_id == user_id,
            models.UserQuestionHistory.question_type == models.QuestionType.APTITUDE,
            models.UserQuestionHistory.is_correct == True
        )
        history_result = await db.execute(history_query)
        correct_question_ids = history_result.scalars().all()
        
        if correct_question_ids:
            query = query.where(~models.Question.id.cast(String).in_(correct_question_ids))
    
    result = await db.execute(query)
    questions = result.scalars().all()
    return questions

@app.get("/coding_assessment")
async def get_coding_assessment(difficulty: str, user_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    difficulty = difficulty.upper()
    valid_difficulties = ["EASY", "MEDIUM", "HARD"]
    if difficulty not in valid_difficulties:
        return {"error": "Invalid difficulty"}
        
    correct_question_ids = []
    if user_id:
        history_query = select(models.UserQuestionHistory.question_id).where(
            models.UserQuestionHistory.user_id == user_id,
            models.UserQuestionHistory.question_type == models.QuestionType.CODING,
            models.UserQuestionHistory.is_correct == True
        )
        history_result = await db.execute(history_query)
        correct_question_ids = history_result.scalars().all()

    num_easy, num_medium, num_hard = 0, 0, 0
    if difficulty == "EASY":
        num_easy = 5
    elif difficulty == "MEDIUM":
        num_easy = 3
        num_medium = 2
    elif difficulty == "HARD":
        num_easy = 1
        num_medium = 2
        num_hard = 2

    assessment = []
    
    async def fetch_questions(level, limit):
        q = select(models.CodingQuestion).where(models.CodingQuestion.difficulty == level)
        if correct_question_ids:
            q = q.where(~models.CodingQuestion.id.cast(String).in_(correct_question_ids))
        q = q.order_by(func.random()).limit(limit)
        res = await db.execute(q)
        return res.scalars().all()

    if num_easy > 0:
        assessment.extend(await fetch_questions(models.DifficultyLevel.EASY, num_easy))
    if num_medium > 0:
        assessment.extend(await fetch_questions(models.DifficultyLevel.MEDIUM, num_medium))
    if num_hard > 0:
        assessment.extend(await fetch_questions(models.DifficultyLevel.HARD, num_hard))
        
    response = []
    for q in assessment:
        q_dict = {
            "id": q.id,
            "title": q.title,
            "difficulty": q.difficulty,
            "description": q.description,
            "examples": q.examples_json,
            "constraints": q.constraints_json,
            "starterCode": q.starter_code_json,
            "topics": q.topics_json,
            "companies": q.companies_json
        }
        if q.difficulty == "EASY":
            q_dict["time_limit_minutes"] = 10
        elif q.difficulty == "MEDIUM":
            q_dict["time_limit_minutes"] = 25
        elif q.difficulty == "HARD":
            q_dict["time_limit_minutes"] = 40
            
        response.append(q_dict)
        
    return response
