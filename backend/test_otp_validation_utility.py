import json
import time
import pytest
from app.core.redis import redis_client, store_otp, verify_otp, delete_otp

def test_otp_validation_utility_flow():
    """
    Test the full flow of the Redis OTP validation utility:
    - store_otp stores the OTP in the correct format (JSON with otp and created_at).
    - verify_otp successfully verifies the correct OTP and fails for incorrect ones.
    - delete_otp removes the OTP from Redis.
    """
    phone = "+919876543219"
    otp_code = "888999"
    
    # Clean up first to ensure a clean state
    delete_otp(phone)
    
    # 1. Test store_otp
    success = store_otp(phone, otp_code, expire_seconds=60)
    assert success is True
    
    # 2. Verify stored format directly in Redis
    raw_val = redis_client.get(f"otp:{phone}")
    assert raw_val is not None
    
    parsed = json.loads(raw_val)
    assert isinstance(parsed, dict)
    assert parsed["otp"] == otp_code
    assert "created_at" in parsed
    
    # 3. Test verify_otp with incorrect OTP
    assert verify_otp(phone, "000000", delete_on_success=False) is False
    # Ensure it was not deleted due to mismatch or false delete_on_success flag
    assert redis_client.get(f"otp:{phone}") is not None
    
    # 4. Test verify_otp with correct OTP
    assert verify_otp(phone, otp_code, delete_on_success=True) is True
    # Ensure replay prevention (deleted on success)
    assert redis_client.get(f"otp:{phone}") is None
    
    # 5. Test store and delete_otp
    assert store_otp(phone, otp_code, expire_seconds=60) is True
    assert redis_client.get(f"otp:{phone}") is not None
    assert delete_otp(phone) is True
    assert redis_client.get(f"otp:{phone}") is None

def test_otp_validation_expiration():
    """
    Test that the stored OTP honors expiration.
    """
    phone = "+919876543218"
    otp_code = "111222"
    
    # Store with 1 second TTL
    success = store_otp(phone, otp_code, expire_seconds=1)
    assert success is True
    
    # Sleep to allow expiration
    time.sleep(1.5)
    
    # Attempt verification (should fail as key is expired)
    assert verify_otp(phone, otp_code) is False
    assert redis_client.get(f"otp:{phone}") is None

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
