import uuid
import datetime
from sqlalchemy import Column, String, Integer, Float, Enum, Text, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
import enum
from database import Base

class DifficultyLevel(str, enum.Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"

class QuestionType(str, enum.Enum):
    APTITUDE = "APTITUDE"
    CODING = "CODING"

class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(String, index=True, nullable=False) # e.g., Quant
    topic = Column(String, index=True, nullable=False)    # e.g., Fractions
    difficulty = Column(Enum(DifficultyLevel), nullable=False)
    time_limit_seconds = Column(Integer, default=90)
    question_text = Column(Text, nullable=False)
    options_json = Column(JSONB, nullable=False)          # Store array of options
    correct_answer = Column(String, nullable=False)
    explanation_html = Column(Text, nullable=False)

class CodingQuestion(Base):
    __tablename__ = "coding_questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    difficulty = Column(Enum(DifficultyLevel), nullable=False)
    description = Column(Text, nullable=False)
    examples_json = Column(JSONB, nullable=False)
    constraints_json = Column(JSONB, nullable=False)
    starter_code_json = Column(JSONB, nullable=False)
    topics_json = Column(JSONB, nullable=False)
    companies_json = Column(JSONB, nullable=True)

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, index=True, nullable=False)
    topic = Column(String, index=True, nullable=False)
    questions_attempted = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    accuracy_percentage = Column(Float, default=0.0)

class UserQuestionHistory(Base):
    __tablename__ = "user_question_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, index=True, nullable=False)
    question_id = Column(String, index=True, nullable=False)
    question_type = Column(Enum(QuestionType), nullable=False)
    is_correct = Column(Boolean, nullable=False, default=False)
    attempted_at = Column(DateTime, default=datetime.datetime.utcnow)
