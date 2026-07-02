import sys
import os
from sqlalchemy import text

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load dotenv to ensure env vars are populated
from dotenv import load_dotenv
load_dotenv()

from app.core.database import engine

def run_db_connection():
    print("Testing connection to database...")
    print(f"DATABASE_URL configured: {engine.url.render_as_string(hide_password=False)}")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1;"))
            row = result.fetchone()
            print(f"Database connection successful! Query result: {row}")
            return True
    except Exception as e:
        print(f"Database connection failed! Error: {e}", file=sys.stderr)
        return False

def test_db_connection():
    assert run_db_connection() is True

if __name__ == "__main__":
    success = run_db_connection()
    sys.exit(0 if success else 1)
