import asyncio
from database import AsyncSessionLocal
from sqlalchemy import text

async def count_questions():
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT COUNT(*) FROM questions"))
        count = result.scalar()
        print(f"Total rows in DB: {count}")
        
        result2 = await session.execute(text("SELECT topic, COUNT(*) FROM questions GROUP BY topic"))
        for row in result2:
            print(f"{row[0]}: {row[1]}")

if __name__ == "__main__":
    asyncio.run(count_questions())
