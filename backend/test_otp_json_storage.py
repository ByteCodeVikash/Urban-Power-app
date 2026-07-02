import json
import pytest
from app.core.redis import redis_client, set_otp, verify_otp, cache_get

def test_otp_json_format_and_reuse():
    """
    Test that set_otp serializes the OTP along with a created_at timestamp
    as a JSON object in Redis, overwrites old OTP, and that verify_otp works correctly.
    """
    phone = "+919999999999"
    otp_code = "123456"
    
    # 1. Set OTP
    success = set_otp(phone, otp_code, expire_seconds=60)
    assert success is True

    # 2. Inspect raw key directly from redis_client to verify stored format
    raw_val = redis_client.get(f"otp:{phone}")
    assert raw_val is not None
    
    parsed = json.loads(raw_val)
    assert isinstance(parsed, dict)
    assert parsed["otp"] == otp_code
    assert "created_at" in parsed
    
    # 3. Test overwrite
    new_otp_code = "654321"
    success_overwrite = set_otp(phone, new_otp_code, expire_seconds=60)
    assert success_overwrite is True
    
    # Verify the value got overwritten
    raw_val_updated = redis_client.get(f"otp:{phone}")
    parsed_updated = json.loads(raw_val_updated)
    assert parsed_updated["otp"] == new_otp_code
    
    # 4. Verify using the helper
    # Matching OTP
    assert verify_otp(phone, new_otp_code, delete_on_success=True) is True
    
    # Verify replay prevention (should be deleted)
    assert verify_otp(phone, new_otp_code) is False
    assert redis_client.get(f"otp:{phone}") is None
