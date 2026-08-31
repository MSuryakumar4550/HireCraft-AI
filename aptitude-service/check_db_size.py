import asyncio
from database import engine
from sqlalchemy import text

async def get_db_size():
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT pg_size_pretty(pg_database_size(current_database()))"))
        size = result.scalar()
        
        table_res = await conn.execute(text("SELECT pg_size_pretty(pg_total_relation_size('questions'))"))
        table_size = table_res.scalar()
        print(f"Total Database Size: {size}")
        print(f"Questions Table Size: {table_size}")

if __name__ == "__main__":
    asyncio.run(get_db_size())
