import sys
import os
import time

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load dotenv to ensure env vars are populated
from dotenv import load_dotenv
load_dotenv()

from app.core.redis import (
    verify_redis_connection,
    set_otp,
    verify_otp,
    set_session,
    get_session,
    delete_session
)

def run_redis_operations():
    print("==================================================")
    print("Testing Redis Integration...")
    print("==================================================")
    
    # 1. Health check / Ping
    if not verify_redis_connection():
        print("FAIL: Redis connection health check failed!", file=sys.stderr)
        return False
    print("PASS: Redis connection health check successful!")
    
    # 2. Test OTP caching and verification (with auto-deletion/replay prevention)
    test_identifier = "user_test_identifier@example.com"
    test_otp_val = "987654"
    
    # Set OTP
    if not set_otp(test_identifier, test_otp_val, expire_seconds=30):
        print(f"FAIL: Setting OTP for {test_identifier} failed!", file=sys.stderr)
        return False
    print(f"PASS: OTP stored successfully for {test_identifier}.")
    
    # Verify OTP (matching value)
    if not verify_otp(test_identifier, test_otp_val):
        print(f"FAIL: Verification of valid OTP failed!", file=sys.stderr)
        return False
    print("PASS: OTP verified successfully.")
    
    # Verify replay prevention (should be deleted now)
    if verify_otp(test_identifier, test_otp_val):
        print("FAIL: Replay prevention failed! OTP was not deleted on success.", file=sys.stderr)
        return False
    print("PASS: Replay prevention verified (OTP was deleted after successful check).")
    
    # Verify non-matching OTP
    set_otp(test_identifier, test_otp_val, expire_seconds=30)
    if verify_otp(test_identifier, "000000"):
        print("FAIL: Verification of incorrect OTP passed erroneously!", file=sys.stderr)
        return False
    print("PASS: Incorrect OTP rejected correctly.")
    verify_otp(test_identifier, test_otp_val)  # Clean up
    
    # 3. Test Session Storage
    test_session_id = "session_abcdef123456"
    test_session_data = {
        "user_id": 1001,
        "username": "urban_test_user",
        "roles": ["customer", "moderator"],
        "active": True
    }
    
    # Set Session
    if not set_session(test_session_id, test_session_data, expire_seconds=60):
        print("FAIL: Storing session data failed!", file=sys.stderr)
        return False
    print("PASS: Session data stored successfully.")
    
    # Get Session
    retrieved_data = get_session(test_session_id)
    if retrieved_data != test_session_data:
        print(f"FAIL: Retrieved session data {retrieved_data} does not match stored {test_session_data}!", file=sys.stderr)
        return False
    print("PASS: Retrieved session data matches original stored data.")
    
    # Delete Session
    if not delete_session(test_session_id):
        print("FAIL: Deleting session data failed!", file=sys.stderr)
        return False
    print("PASS: Session deleted successfully.")
    
    # Verify deletion
    deleted_data = get_session(test_session_id)
    if deleted_data is not None:
        print("FAIL: Deleted session data was still retrieved!", file=sys.stderr)
        return False
    print("PASS: Session deletion verified (retrieval returned None).")
    
    print("\n==================================================")
    print("All Redis integration tests passed successfully!")
    print("==================================================")
    return True

def test_redis_operations():
    assert run_redis_operations() is True

if __name__ == "__main__":
    success = run_redis_operations()
    sys.exit(0 if success else 1)
