import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def create_database():
    # Connect to the default 'postgres' database to create the new one
    try:
        # We parse the DATABASE_URL to get credentials but connect to 'postgres' db
        conn = await asyncpg.connect(
            user='postgres',
            password='Surya@123',
            database='postgres',
            host='localhost',
            port=5432
        )
        
        # Check if database exists
        exists = await conn.fetchval("SELECT 1 FROM pg_database WHERE datname = 'aptitude_db'")
        if not exists:
            print("Creating database aptitude_db...")
            await conn.execute('CREATE DATABASE aptitude_db')
            print("Database aptitude_db created successfully.")
        else:
            print("Database aptitude_db already exists.")
            
        await conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    asyncio.run(create_database())
