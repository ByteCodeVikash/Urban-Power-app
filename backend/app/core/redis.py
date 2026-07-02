import json
import logging
from typing import Any, Dict, Optional
import redis
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Redis client with connection pool
redis_pool = redis.ConnectionPool(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    decode_responses=True  # Automatically decode bytes to strings
)

redis_client = redis.Redis(connection_pool=redis_pool)

def verify_redis_connection() -> bool:
    """
    Ping the Redis server to verify connectivity.
    """
    try:
        redis_client.ping()
        logger.info("Successfully connected to Redis.")
        return True
    except redis.ConnectionError as e:
        logger.error(f"Failed to connect to Redis: {e}")
        return False

# --- OTP Caching Helpers ---

def set_otp(phone_or_email: str, otp: str, expire_seconds: int = 300) -> bool:
    """
    Store an OTP in Redis with an expiration time (default 5 minutes).
    Reuses cache_set to store the OTP and its generation timestamp as a JSON object.
    """
    from datetime import datetime, timezone
    key = f"otp:{phone_or_email}"
    value = {
        "otp": otp,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    return cache_set(key, value, expire_seconds)

def verify_otp(phone_or_email: str, otp: str, delete_on_success: bool = True) -> bool:
    """
    Verify the provided OTP against the cached OTP dictionary.
    Optionally delete the OTP on successful verification to prevent reuse.
    """
    key = f"otp:{phone_or_email}"
    try:
        cached_data = cache_get(key)
        if cached_data and isinstance(cached_data, dict):
            cached_otp = cached_data.get("otp")
            if cached_otp and cached_otp == otp:
                if delete_on_success:
                    cache_delete(key)
                return True
        return False
    except Exception as e:
        logger.error(f"Error verifying OTP in Redis for key {key}: {e}")
        return False

def store_otp(phone_or_email: str, otp: str, expire_seconds: int = 300) -> bool:
    """
    Store an OTP in Redis with an expiration time.
    Reuses set_otp internally to maintain the correct format.
    """
    return set_otp(phone_or_email, otp, expire_seconds)

def delete_otp(phone_or_email: str) -> bool:
    """
    Delete an OTP from Redis.
    """
    key = f"otp:{phone_or_email}"
    return cache_delete(key)


# --- Temporary Session Storage Helpers ---

def set_session(session_id: str, data: Dict[str, Any], expire_seconds: int = 3600) -> bool:
    """
    Store temporary session data in Redis as a JSON-serialized string.
    """
    key = f"session:{session_id}"
    try:
        serialized_data = json.dumps(data)
        return bool(redis_client.setex(key, expire_seconds, serialized_data))
    except Exception as e:
        logger.error(f"Error setting session in Redis for key {key}: {e}")
        return False

def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve and deserialize session data from Redis.
    """
    key = f"session:{session_id}"
    try:
        serialized_data = redis_client.get(key)
        if serialized_data:
            return json.loads(serialized_data)
        return None
    except Exception as e:
        logger.error(f"Error getting session from Redis for key {key}: {e}")
        return None

def delete_session(session_id: str) -> bool:
    """
    Delete session data from Redis.
    """
    key = f"session:{session_id}"
    try:
        return bool(redis_client.delete(key))
    except Exception as e:
        logger.error(f"Error deleting session from Redis for key {key}: {e}")
        return False


# --- Async Redis Connection Manager & Dependency ---

class RedisConnectionManager:
    """
    Manages the lifecycle of the async Redis connection.
    """
    def __init__(self):
        self.pool: Optional[aioredis.ConnectionPool] = None
        self.client: Optional[aioredis.Redis] = None

    def init_redis(self, host: str, port: int, db: int):
        """
        Initialize the connection pool and client.
        """
        logger.info(f"Initializing async Redis connection to {host}:{port}/{db}")
        self.pool = aioredis.ConnectionPool(
            host=host,
            port=port,
            db=db,
            decode_responses=True
        )
        self.client = aioredis.Redis(connection_pool=self.pool)

    async def close(self):
        """
        Close the Redis client and disconnect the connection pool.
        """
        if self.client:
            logger.info("Closing async Redis client.")
            await self.client.aclose()
        if self.pool:
            logger.info("Disconnecting async Redis connection pool.")
            await self.pool.disconnect()

    async def ping(self) -> bool:
        """
        Ping the Redis server using the async client.
        """
        if not self.client:
            logger.warning("Async Redis client is not initialized.")
            return False
        try:
            await self.client.ping()
            logger.info("Successfully connected to async Redis.")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to async Redis: {e}")
            return False

redis_manager = RedisConnectionManager()

async def get_redis() -> aioredis.Redis:
    """
    Dependency generator for obtaining an async Redis client instance.
    """
    if redis_manager.client is None:
        raise RuntimeError("Async Redis client is not initialized.")
    return redis_manager.client


# --- Generic Caching Helpers (Sync) ---

def cache_set(key: str, value: Any, expire_seconds: Optional[int] = None) -> bool:
    """
    Cache a value in Redis with optional TTL (seconds) and JSON serialization.
    """
    try:
        serialized_value = json.dumps(value)
        if expire_seconds is not None:
            return bool(redis_client.setex(key, expire_seconds, serialized_value))
        else:
            return bool(redis_client.set(key, serialized_value))
    except Exception as e:
        logger.error(f"Error setting cache for key {key}: {e}", exc_info=True)
        return False

def cache_get(key: str) -> Optional[Any]:
    """
    Retrieve a value from Redis and deserialize it from JSON.
    Returns None if the key does not exist or on exception.
    """
    try:
        serialized_value = redis_client.get(key)
        if serialized_value is None:
            return None
        return json.loads(serialized_value)
    except Exception as e:
        logger.error(f"Error getting cache for key {key}: {e}", exc_info=True)
        return None

def cache_delete(key: str) -> bool:
    """
    Delete a key from Redis.
    """
    try:
        return bool(redis_client.delete(key))
    except Exception as e:
        logger.error(f"Error deleting cache for key {key}: {e}", exc_info=True)
        return False

def cache_exists(key: str) -> bool:
    """
    Check if a key exists in Redis.
    """
    try:
        return bool(redis_client.exists(key))
    except Exception as e:
        logger.error(f"Error checking cache existence for key {key}: {e}", exc_info=True)
        return False


# --- Generic Caching Helpers (Async) ---

async def cache_set_async(key: str, value: Any, expire_seconds: Optional[int] = None) -> bool:
    """
    Cache a value in Redis asynchronously with optional TTL (seconds) and JSON serialization.
    """
    if redis_manager.client is None:
        logger.warning(f"Async Redis client is not initialized when setting key {key}.")
        return False
    try:
        serialized_value = json.dumps(value)
        if expire_seconds is not None:
            return bool(await redis_manager.client.setex(key, expire_seconds, serialized_value))
        else:
            return bool(await redis_manager.client.set(key, serialized_value))
    except Exception as e:
        logger.error(f"Error setting async cache for key {key}: {e}", exc_info=True)
        return False

async def cache_get_async(key: str) -> Optional[Any]:
    """
    Retrieve a value from Redis asynchronously and deserialize it from JSON.
    Returns None if the key does not exist or on exception.
    """
    if redis_manager.client is None:
        logger.warning(f"Async Redis client is not initialized when getting key {key}.")
        return None
    try:
        serialized_value = await redis_manager.client.get(key)
        if serialized_value is None:
            return None
        return json.loads(serialized_value)
    except Exception as e:
        logger.error(f"Error getting async cache for key {key}: {e}", exc_info=True)
        return None

async def cache_delete_async(key: str) -> bool:
    """
    Delete a key from Redis asynchronously.
    """
    if redis_manager.client is None:
        logger.warning(f"Async Redis client is not initialized when deleting key {key}.")
        return False
    try:
        return bool(await redis_manager.client.delete(key))
    except Exception as e:
        logger.error(f"Error deleting async cache for key {key}: {e}", exc_info=True)
        return False

async def cache_exists_async(key: str) -> bool:
    """
    Check if a key exists in Redis asynchronously.
    """
    if redis_manager.client is None:
        logger.warning(f"Async Redis client is not initialized when checking key {key}.")
        return False
    try:
        return bool(await redis_manager.client.exists(key))
    except Exception as e:
        logger.error(f"Error checking async cache existence for key {key}: {e}", exc_info=True)
        return False

