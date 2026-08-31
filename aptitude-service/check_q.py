import asyncio
from database import AsyncSessionLocal
from sqlalchemy import text

async def check():
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT COUNT(*) FROM questions WHERE question_text LIKE 'What is the average of the first 100 positive integers?'"))
        count = result.scalar()
        print(f"Count of 'first 100 positive integers' question: {count}")
        
        result2 = await session.execute(text("SELECT COUNT(*) FROM questions WHERE question_text LIKE 'What is the average of the first 50 natural numbers?'"))
        count2 = result2.scalar()
        print(f"Count of 'first 50 natural numbers' question: {count2}")

if __name__ == "__main__":
    asyncio.run(check())
