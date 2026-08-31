import asyncio
from database import AsyncSessionLocal
from sqlalchemy import text

async def get_questions():
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT question_text FROM questions WHERE topic = 'Averages' LIMIT 5"))
        for i, row in enumerate(result):
            print(f"{i+1}. {row[0]}")

if __name__ == "__main__":
    asyncio.run(get_questions())
