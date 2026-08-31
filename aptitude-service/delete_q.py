import asyncio
from database import AsyncSessionLocal
from sqlalchemy import text

async def delete_question():
    async with AsyncSessionLocal() as session:
        await session.execute(text("DELETE FROM questions WHERE question_text LIKE 'A sum of money amounts to Rs. 9800 after 5 years%'"))
        await session.commit()
        print("Successfully deleted the extra question.")

if __name__ == "__main__":
    asyncio.run(delete_question())
