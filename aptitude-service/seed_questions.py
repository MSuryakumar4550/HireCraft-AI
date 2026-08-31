import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, AsyncSessionLocal, Base
from models import Question, DifficultyLevel

# Hardcoded realistic aptitude questions
SAMPLE_QUESTIONS = [
    {
        "category": "Quant",
        "topic": "Percentages",
        "difficulty": DifficultyLevel.MEDIUM,
        "question_text": "If the price of a book is increased by 20% and then decreased by 20%, what is the net change in the price?",
        "options_json": ["No change", "4% increase", "4% decrease", "2% decrease"],
        "correct_answer": "4% decrease",
        "explanation_html": "<p>Let the original price be 100. After 20% increase, it becomes 120. After 20% decrease on 120, the price becomes 120 - 24 = 96. So, the net change is a 4% decrease.</p>"
    },
    {
        "category": "Quant",
        "topic": "Geometry",
        "difficulty": DifficultyLevel.EASY,
        "question_text": "What is the area of a circle with a radius of 7 cm? (Use π = 22/7)",
        "options_json": ["154 sq cm", "44 sq cm", "144 sq cm", "164 sq cm"],
        "correct_answer": "154 sq cm",
        "explanation_html": "<p>Area = π * r^2 = (22/7) * 7 * 7 = 154 sq cm.</p>"
    },
    {
        "category": "Quant",
        "topic": "Algebra",
        "difficulty": DifficultyLevel.HARD,
        "question_text": "If x + y = 10 and xy = 21, what is the value of x^2 + y^2?",
        "options_json": ["58", "42", "100", "79"],
        "correct_answer": "58",
        "explanation_html": "<p>(x+y)^2 = x^2 + y^2 + 2xy. So, 100 = x^2 + y^2 + 42. x^2 + y^2 = 58.</p>"
    },
    {
        "category": "Quant",
        "topic": "Time and Work",
        "difficulty": DifficultyLevel.MEDIUM,
        "question_text": "A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is:",
        "options_json": ["1/4", "1/10", "7/15", "8/15"],
        "correct_answer": "8/15",
        "explanation_html": "<p>A's 1 day work = 1/15, B's 1 day work = 1/20. Together 1 day work = 1/15 + 1/20 = 7/60. Work done in 4 days = 28/60 = 7/15. Work left = 1 - (7/15) = 8/15.</p>"
    },
    {
        "category": "Logical",
        "topic": "Logical Reasoning",
        "difficulty": DifficultyLevel.HARD,
        "question_text": "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?",
        "options_json": ["(1/3)", "(1/8)", "(2/8)", "(1/16)"],
        "correct_answer": "(1/8)",
        "explanation_html": "<p>This is a simple alternating division series; each number is one-half of the previous number.</p>"
    },
    {
        "category": "Logical",
        "topic": "Blood Relations",
        "difficulty": DifficultyLevel.MEDIUM,
        "question_text": "Pointing to a photograph of a boy Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
        "options_json": ["Brother", "Uncle", "Cousin", "Father"],
        "correct_answer": "Father",
        "explanation_html": "<p>The boy in the photograph is the son of the only son of Suresh's mother i.e., the son of Suresh. Hence, Suresh is the father of the boy.</p>"
    },
    {
        "category": "Logical",
        "topic": "Coding Decoding",
        "difficulty": DifficultyLevel.EASY,
        "question_text": "In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written in the same code?",
        "options_json": ["EOJDJEFM", "EOJDEJFM", "MFEJDJOE", "MFEDJJOE"],
        "correct_answer": "EOJDJEFM",
        "explanation_html": "<p>The letters of the word are written in reverse order and each letter, except the first and the last one, is moved one step forward.</p>"
    },
    {
        "category": "Verbal",
        "topic": "Synonyms",
        "difficulty": DifficultyLevel.MEDIUM,
        "question_text": "Choose the exact synonym of the word: OBSCURE",
        "options_json": ["Clear", "Hidden", "Famous", "Obvious"],
        "correct_answer": "Hidden",
        "explanation_html": "<p>Obscure means not discovered or known about; uncertain or hidden.</p>"
    },
    {
        "category": "Verbal",
        "topic": "Sentence Correction",
        "difficulty": DifficultyLevel.HARD,
        "question_text": "Identify the grammatically correct sentence:",
        "options_json": ["The group of students are going on a trip.", "The group of students is going on a trip.", "The groups of student is going on a trip.", "The group of student are going on a trip."],
        "correct_answer": "The group of students is going on a trip.",
        "explanation_html": "<p>'Group' is a collective noun and takes a singular verb 'is'.</p>"
    },
    {
        "category": "Verbal",
        "topic": "Reading Comprehension",
        "difficulty": DifficultyLevel.EASY,
        "question_text": "If 'All dogs bark' and 'Max is a dog', what can be concluded?",
        "options_json": ["Max doesn't bark", "Max barks", "Max is a cat", "Some dogs bark"],
        "correct_answer": "Max barks",
        "explanation_html": "<p>Since Max belongs to the set of dogs, and all dogs bark, Max must bark.</p>"
    }
]

async def seed_database():
    print("Ensuring database tables exist...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        print("Inserting sample questions without any ML models...")
        for q_data in SAMPLE_QUESTIONS:
            question = Question(**q_data)
            session.add(question)
                
        print("Committing to database...")
        await session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())

