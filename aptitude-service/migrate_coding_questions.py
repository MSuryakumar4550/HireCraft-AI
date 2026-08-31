import asyncio
import json
import os
from sqlalchemy.ext.asyncio import AsyncSession
from database import AsyncSessionLocal, engine
import models

async def migrate_coding_questions():
    # Create tables first
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
        
    json_path = os.path.join("..", "frontend", "src", "data", "codingQuestions.json")
    
    if not os.path.exists(json_path):
        print(f"Error: Could not find {json_path}")
        return

    with open(json_path, 'r') as f:
        data = json.load(f)

    async with AsyncSessionLocal() as session:
        for q_data in data:
            # Check if it already exists to avoid duplicates
            from sqlalchemy import select
            result = await session.execute(select(models.CodingQuestion).filter_by(id=q_data['id']))
            existing_q = result.scalars().first()
            
            if existing_q:
                print(f"Question {q_data['id']} already exists, skipping...")
                continue
            
            difficulty_str = q_data['difficulty'].upper()
            
            coding_question = models.CodingQuestion(
                id=q_data['id'],
                title=q_data['title'],
                difficulty=models.DifficultyLevel(difficulty_str),
                description=q_data['description'],
                examples_json=q_data['examples'],
                constraints_json=q_data['constraints'],
                starter_code_json=q_data['starterCode'],
                topics_json=q_data.get('topics', []),
                companies_json=q_data.get('companies', [])
            )
            session.add(coding_question)
            
        await session.commit()
        print("Migration complete!")

if __name__ == "__main__":
    asyncio.run(migrate_coding_questions())
