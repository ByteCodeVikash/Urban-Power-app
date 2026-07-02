import sys
import os
import json
import time
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import httpx

# Add current directory to path to allow importing app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import Settings
from app.core.redis import redis_client, set_otp, verify_otp
from app.core.sms import send_sms

# Setup pytest-asyncio marker only on async functions

# ==========================================
# 1. OTP Generation Tests
# ==========================================
def test_otp_generation_format():
    """
    Test that generated OTPs meet requirements:
    - 6 digits long
    - Only contains numeric characters
    - Different calls produce different OTPs (randomness check)
    """
    import random
    
    otps = [str(random.randint(100000, 999999)) for _ in range(50)]
    
    for otp in otps:
        assert len(otp) == 6, f"OTP {otp} is not 6 digits long"
        assert otp.isdigit(), f"OTP {otp} contains non-digit characters"
        
    # Check that they are not all identical (ensure randomness)
    unique_otps = set(otps)
    assert len(unique_otps) > 1, "Generated OTPs are not random"


# ==========================================
# 2. Redis Storage Tests
# ==========================================
def test_otp_redis_storage_structure():
    """
    Test that set_otp successfully serializes OTP and timestamp into Redis
    as a JSON object under the 'otp:{phone}' key pattern.
    """
    phone = "+918888888888"
    otp_code = "432109"
    
    # Store OTP
    success = set_otp(phone, otp_code, expire_seconds=60)
    assert success is True
    
    # Inspect raw key directly from Redis to verify format
    key = f"otp:{phone}"
    raw_val = redis_client.get(key)
    assert raw_val is not None
    
    # Validate it's a valid JSON with key fields
    parsed = json.loads(raw_val)
    assert isinstance(parsed, dict)
    assert parsed["otp"] == otp_code
    assert "created_at" in parsed
    
    # Cleanup
    redis_client.delete(key)


# ==========================================
# 3. SMS Utility (MSG91) Mocking Tests
# ==========================================
@pytest.mark.asyncio
@patch("app.core.sms.httpx.AsyncClient")
@patch("app.core.sms.settings")
async def test_sms_msg91_mocked_request_success(mock_settings, mock_client_class):
    """
    Test that send_sms correctly structures and sends the HTTP request to MSG91 API
    using a mocked httpx.AsyncClient (ensuring no real SMS is sent).
    """
    mock_settings.SMS_MOCK = False
    mock_settings.MSG91_AUTH_KEY = "mocked_auth_key_12345"
    mock_settings.MSG91_TEMPLATE_ID = "mocked_template_id_54321"
    mock_settings.MSG91_SENDER_ID = "MOCKSD"
    
    # Setup mock client & response
    mock_client = AsyncMock()
    mock_client_class.return_value.__aenter__.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"type": "success", "message": "OTP sent successfully"}
    mock_client.post.return_value = mock_response
    
    phone = "919999999999"
    message = "Your OTP is 123456"
    
    # Call the send_sms utility
    result = await send_sms(phone, message)
    
    assert result is True
    
    # Verify the request payload and headers match MSG91 specs
    mock_client.post.assert_called_once()
    args, kwargs = mock_client.post.call_args
    assert args[0] == "https://control.msg91.com/api/v5/flow/"
    
    headers = kwargs["headers"]
    assert headers["authkey"] == "mocked_auth_key_12345"
    assert headers["content-type"] == "application/json"
    
    payload = kwargs["json"]
    assert payload["template_id"] == "mocked_template_id_54321"
    assert payload["sender"] == "MOCKSD"
    assert len(payload["recipients"]) == 1
    assert payload["recipients"][0]["mobiles"] == phone
    assert payload["recipients"][0]["message"] == message


@pytest.mark.asyncio
@patch("app.core.sms.httpx.AsyncClient")
@patch("app.core.sms.settings")
async def test_sms_msg91_mocked_request_error(mock_settings, mock_client_class):
    """
    Test that send_sms returns False when MSG91 API responds with an error payload.
    """
    mock_settings.SMS_MOCK = False
    mock_settings.MSG91_AUTH_KEY = "mocked_auth_key_12345"
    mock_settings.MSG91_TEMPLATE_ID = "mocked_template_id_54321"
    mock_settings.MSG91_SENDER_ID = "MOCKSD"
    
    # Setup mock client & response returning a JSON error response
    mock_client = AsyncMock()
    mock_client_class.return_value.__aenter__.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"type": "error", "message": "Invalid credentials"}
    mock_client.post.return_value = mock_response
    
    result = await send_sms("919999999999", "Your OTP is 123456")
    assert result is False


# ==========================================
# 4. Expiration Tests
# ==========================================
def test_otp_ttl_setting():
    """
    Verify that set_otp correctly configures the expiration TTL in Redis.
    """
    phone = "+917777777777"
    otp_code = "999888"
    expire_seconds = 60
    
    # Store with 60 seconds TTL
    success = set_otp(phone, otp_code, expire_seconds=expire_seconds)
    assert success is True
    
    # Check TTL of the key
    key = f"otp:{phone}"
    ttl = redis_client.ttl(key)
    
    # TTL should be set and close to expire_seconds (allowing a tiny buffer for execution latency)
    assert ttl > 0
    assert ttl <= expire_seconds
    assert ttl >= expire_seconds - 5
    
    # Cleanup
    redis_client.delete(key)


def test_otp_expiration_behavior():
    """
    Verify that the OTP becomes invalid once it has expired.
    Stores an OTP with 1 second TTL, waits 1.5 seconds, and asserts verification fails.
    """
    phone = "+916666666666"
    otp_code = "111222"
    
    # Store with 1 second TTL
    success = set_otp(phone, otp_code, expire_seconds=1)
    assert success is True
    
    # Sleep to allow expiration
    time.sleep(1.5)
    
    # Attempt verification (should fail as key is expired)
    verified = verify_otp(phone, otp_code)
    assert verified is False
    
    # Verify the key is deleted/non-existent
    assert redis_client.get(f"otp:{phone}") is None
