import os
from typing import Optional
import json

# Mock Redis for development
USE_REDIS = os.getenv("USE_REDIS", "false").lower() == "true"

if USE_REDIS:
    try:
        import redis
        redis_client = redis.Redis(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            db=0,
            decode_responses=True
        )
        # Test connection
        redis_client.ping()
        print("✅ Redis connected successfully")
    except Exception as e:
        print(f"⚠️  Redis connection failed: {e}. Using in-memory cache.")
        USE_REDIS = False
        redis_client = None
else:
    redis_client = None
    print("⚠️  Redis disabled. Using in-memory cache.")

# In-memory cache fallback
_memory_cache = {}

def cache_get(key: str) -> Optional[str]:
    """Get value from cache"""
    if USE_REDIS and redis_client:
        try:
            return redis_client.get(key)
        except Exception as e:
            print(f"Redis get error: {e}")
            return _memory_cache.get(key)
    return _memory_cache.get(key)

def cache_set(key: str, value: str, expire: int = 300):
    """Set value in cache with expiration"""
    if USE_REDIS and redis_client:
        try:
            redis_client.setex(key, expire, value)
            return
        except Exception as e:
            print(f"Redis set error: {e}")
    _memory_cache[key] = value

def cache_delete(key: str):
    """Delete key from cache"""
    if USE_REDIS and redis_client:
        try:
            redis_client.delete(key)
            return
        except Exception as e:
            print(f"Redis delete error: {e}")
    if key in _memory_cache:
        del _memory_cache[key]

def cache_clear():
    """Clear all cache"""
    if USE_REDIS and redis_client:
        try:
            redis_client.flushdb()
            return
        except Exception as e:
            print(f"Redis clear error: {e}")
    _memory_cache.clear()

def cache_clear_pattern(pattern: str):
    """Clear cache keys matching pattern"""
    if USE_REDIS and redis_client:
        try:
            keys = redis_client.keys(pattern)
            if keys:
                redis_client.delete(*keys)
            return
        except Exception as e:
            print(f"Redis clear pattern error: {e}")
    
    # For in-memory cache, match pattern
    keys_to_delete = []
    # Convert Redis pattern to Python pattern
    import re
    regex_pattern = pattern.replace('*', '.*').replace('?', '.')
    regex = re.compile(regex_pattern)
    
    for key in list(_memory_cache.keys()):
        if regex.match(key):
            keys_to_delete.append(key)
    
    for key in keys_to_delete:
        del _memory_cache[key]
