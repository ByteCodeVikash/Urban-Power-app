import asyncio
import sys
import os
import time

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load dotenv to ensure env vars are populated
from dotenv import load_dotenv
load_dotenv()

from app.core.config import settings
from app.core.redis import (
    verify_redis_connection,
    redis_manager,
    cache_set,
    cache_get,
    cache_delete,
    cache_exists,
    cache_set_async,
    cache_get_async,
    cache_delete_async,
    cache_exists_async
)

import pytest

def run_sync_cache_operations():
    print("--------------------------------------------------")
    print("Testing Synchronous Redis Cache Utilities...")
    print("--------------------------------------------------")
    
    if not verify_redis_connection():
        print("FAIL: Redis connection health check failed!", file=sys.stderr)
        return False
    print("PASS: Redis connection verified.")

    # 1. Test string serialization and retrieval
    key_str = "cache_test_str"
    val_str = "hello_world_urban_power"
    if not cache_set(key_str, val_str, expire_seconds=30):
        print(f"FAIL: cache_set failed for string!", file=sys.stderr)
        return False
    if cache_get(key_str) != val_str:
        print(f"FAIL: cache_get returned unexpected value for string!", file=sys.stderr)
        return False
    print("PASS: Sync string cache set/get successful.")

    # 2. Test list serialization and retrieval
    key_list = "cache_test_list"
    val_list = [1, "two", {"three": 3}]
    if not cache_set(key_list, val_list, expire_seconds=30):
        print(f"FAIL: cache_set failed for list!", file=sys.stderr)
        return False
    if cache_get(key_list) != val_list:
        print(f"FAIL: cache_get returned unexpected value for list!", file=sys.stderr)
        return False
    print("PASS: Sync list cache set/get successful.")

    # 3. Test dict serialization and retrieval
    key_dict = "cache_test_dict"
    val_dict = {"service_name": "AC Repair", "price": 49.99, "available": True}
    if not cache_set(key_dict, val_dict, expire_seconds=30):
        print(f"FAIL: cache_set failed for dict!", file=sys.stderr)
        return False
    if cache_get(key_dict) != val_dict:
        print(f"FAIL: cache_get returned unexpected value for dict!", file=sys.stderr)
        return False
    print("PASS: Sync dict cache set/get successful.")

    # 4. Test cache_exists and cache_delete
    if not cache_exists(key_dict):
        print("FAIL: cache_exists returned False for existing key!", file=sys.stderr)
        return False
    if not cache_delete(key_dict):
        print("FAIL: cache_delete failed!", file=sys.stderr)
        return False
    if cache_exists(key_dict):
        print("FAIL: cache_exists returned True for deleted key!", file=sys.stderr)
        return False
    if cache_get(key_dict) is not None:
        print("FAIL: cache_get returned value for deleted key!", file=sys.stderr)
        return False
    print("PASS: Sync cache existence and deletion verified.")

    # 5. Test TTL Expiration
    key_ttl = "cache_test_ttl"
    if not cache_set(key_ttl, "temporary", expire_seconds=1):
        print("FAIL: cache_set with brief TTL failed!", file=sys.stderr)
        return False
    print("Waiting 1.5 seconds for TTL expiration...")
    time.sleep(1.5)
    if cache_exists(key_ttl):
        print("FAIL: Key still exists after TTL expiration!", file=sys.stderr)
        return False
    if cache_get(key_ttl) is not None:
        print("FAIL: Retrieved key after TTL expiration!", file=sys.stderr)
        return False
    print("PASS: Sync cache TTL expiration verified.")
    
    # Cleanup remaining keys
    cache_delete(key_str)
    cache_delete(key_list)
    print("PASS: Sync cache cleanup complete.")
    return True


async def run_async_cache_operations():
    print("--------------------------------------------------")
    print("Testing Asynchronous Redis Cache Utilities...")
    print("--------------------------------------------------")

    # 1. Initialize Redis manager
    redis_manager.init_redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=settings.REDIS_DB
    )

    connected = await redis_manager.ping()
    if not connected:
        print("FAIL: Async Redis ping failed!", file=sys.stderr)
        return False
    print("PASS: Async Redis connection verified.")

    # 2. Test async dict cache set/get
    key_async = "cache_test_async"
    val_async = {"booking_id": 98765, "status": "completed"}
    
    if not await cache_set_async(key_async, val_async, expire_seconds=30):
        print("FAIL: cache_set_async failed!", file=sys.stderr)
        return False
    
    retrieved = await cache_get_async(key_async)
    if retrieved != val_async:
        print(f"FAIL: cache_get_async returned {retrieved} instead of {val_async}!", file=sys.stderr)
        return False
    print("PASS: Async dict cache set/get successful.")

    # 3. Test async cache_exists and cache_delete
    if not await cache_exists_async(key_async):
        print("FAIL: cache_exists_async returned False for existing key!", file=sys.stderr)
        return False
        
    if not await cache_delete_async(key_async):
        print("FAIL: cache_delete_async failed!", file=sys.stderr)
        return False
        
    if await cache_exists_async(key_async):
        print("FAIL: cache_exists_async returned True for deleted key!", file=sys.stderr)
        return False
        
    if await cache_get_async(key_async) is not None:
        print("FAIL: cache_get_async returned value for deleted key!", file=sys.stderr)
        return False
    print("PASS: Async cache existence and deletion verified.")

    # 4. Clean up connection pool
    await redis_manager.close()
    print("PASS: Async Redis manager closed successfully.")
    return True


def test_sync_cache_operations():
    assert run_sync_cache_operations() is True


@pytest.mark.asyncio
async def test_async_cache_operations():
    assert await run_async_cache_operations() is True


if __name__ == "__main__":
    print("==================================================")
    print("Testing Redis Caching Utilities...")
    print("==================================================")
    
    sync_success = run_sync_cache_operations()
    if not sync_success:
        sys.exit(1)
        
    async_success = asyncio.run(run_async_cache_operations())
    if not async_success:
        sys.exit(1)
        
    print("\n==================================================")
    print("All Redis caching utility tests passed successfully!")
    print("==================================================")
    sys.exit(0)
