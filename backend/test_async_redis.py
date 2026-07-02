import asyncio
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load dotenv to ensure env vars are populated
from dotenv import load_dotenv
load_dotenv()

from app.core.config import settings
from app.core.redis import redis_manager, get_redis

import pytest

async def run_test_async_redis_operations():
    print("==================================================")
    print("Testing Async Redis Integration...")
    print("==================================================")

    # 1. Initialize Redis manager
    redis_manager.init_redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=settings.REDIS_DB
    )

    # 2. Ping / Connection test
    connected = await redis_manager.ping()
    if not connected:
        print("FAIL: Async Redis ping failed!", file=sys.stderr)
        return False
    print("PASS: Async Redis ping successful!")

    # 3. Test dependency injection
    client = await get_redis()
    if client is None:
        print("FAIL: Dependency injection returned None client!", file=sys.stderr)
        return False
    print("PASS: Dependency injection retrieved client.")

    # 4. Test async SET/GET/DELETE operations
    test_key = "async_test_cache_key"
    test_value = "urban_power_async_value_123"

    try:
        # SET
        set_result = await client.set(test_key, test_value, ex=30)
        if not set_result:
            print("FAIL: Async SET operation failed!", file=sys.stderr)
            return False
        print("PASS: Async SET operation successful.")

        # GET
        get_result = await client.get(test_key)
        if get_result != test_value:
            print(f"FAIL: Async GET returned '{get_result}' instead of '{test_value}'!", file=sys.stderr)
            return False
        print("PASS: Async GET operation returned correct value.")

        # DELETE
        del_result = await client.delete(test_key)
        if not del_result:
            print("FAIL: Async DELETE operation failed!", file=sys.stderr)
            return False
        print("PASS: Async DELETE operation successful.")

        # Verify DELETE
        deleted_val = await client.get(test_key)
        if deleted_val is not None:
            print(f"FAIL: Key was not deleted successfully!", file=sys.stderr)
            return False
        print("PASS: Async deletion verified.")

    except Exception as e:
        print(f"FAIL: Exception occurred during Redis operations: {e}", file=sys.stderr)
        return False

    finally:
        # 5. Clean up connection pool
        await redis_manager.close()
        print("PASS: Async Redis Connection Manager closed successfully.")

    print("\n==================================================")
    print("All Async Redis integration tests passed successfully!")
    print("==================================================")
    return True

@pytest.mark.asyncio
async def test_async_redis_operations():
    assert await run_test_async_redis_operations() is True

if __name__ == "__main__":
    success = asyncio.run(run_test_async_redis_operations())
    sys.exit(0 if success else 1)
