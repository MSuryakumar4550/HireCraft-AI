import asyncio
import json
from database import AsyncSessionLocal
from models import Question
from sqlalchemy import select

async def run():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Question).filter(Question.topic == 'Probability').order_by(Question.id).limit(5))
        questions = result.scalars().all()
        
        output = []
        for q in questions:
            output.append({
                "category": q.category,
                "topic": q.topic,
                "difficulty": q.difficulty.value,
                "time_limit_seconds": q.time_limit_seconds,
                "question_text": q.question_text,
                "options_json": json.loads(q.options_json) if isinstance(q.options_json, str) else q.options_json,
                "correct_answer": q.correct_answer,
                "explanation_html": q.explanation_html
            })
        print(json.dumps(output, indent=2))

if __name__ == '__main__':
    asyncio.run(run())
