import pytest
import sys
import os
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.core.config import settings

client = TestClient(app)

def test_send_otp_success_mock_mode():
    """
    Test successful OTP generation, Redis caching, mock SMS calling, and response structure in mock mode.
    """
    payload = {"phone": "+919876543210"}
    
    with patch("app.api.v1.auth.set_otp_async", new_callable=AsyncMock) as mock_set_otp, \
         patch("app.api.v1.auth.send_sms", new_callable=AsyncMock, return_value=True) as mock_send_sms, \
         patch("app.api.v1.auth.settings") as mock_settings:
         
        mock_set_otp.return_value = True
        mock_settings.SMS_MOCK = True
        
        response = client.post("/api/v1/auth/send-otp", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "OTP sent successfully." in data["message"]
        assert data["phone"] == "+919876543210"
        assert "otp" in data
        assert len(data["otp"]) == 6
        assert data["otp"].isdigit()
        
        # Verify set_otp and send_sms were called with correct values
        mock_set_otp.assert_called_once_with("+919876543210", data["otp"])
        mock_send_sms.assert_called_once_with("+919876543210", f"Your Urban Power verification OTP is: {data['otp']}")


def test_send_otp_success_real_mode():
    """
    Test successful OTP flow in real SMS mode (does not expose OTP in response).
    """
    payload = {"phone": "+919876543210"}
    
    with patch("app.api.v1.auth.set_otp_async", new_callable=AsyncMock) as mock_set_otp, \
         patch("app.api.v1.auth.send_sms", new_callable=AsyncMock, return_value=True) as mock_send_sms, \
         patch("app.api.v1.auth.settings") as mock_settings:
         
        mock_set_otp.return_value = True
        mock_settings.SMS_MOCK = False
        
        response = client.post("/api/v1/auth/send-otp", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "OTP sent successfully." in data["message"]
        assert data["phone"] == "+919876543210"
        assert "otp" not in data  # Real mode must NOT return the OTP in the API response
        
        # Verify mock calls
        mock_set_otp.assert_called_once()
        mock_send_sms.assert_called_once()


def test_send_otp_redis_failure():
    """
    Test that endpoint raises a 500 error if Redis caching fails.
    """
    payload = {"phone": "+919876543210"}
    
    with patch("app.api.v1.auth.set_otp_async", new_callable=AsyncMock) as mock_set_otp, \
         patch("app.api.v1.auth.send_sms", new_callable=AsyncMock) as mock_send_sms:
         
        mock_set_otp.return_value = False
         
        response = client.post("/api/v1/auth/send-otp", json=payload)
        
        assert response.status_code == 500
        data = response.json()
        assert "Failed to initialize verification session" in data["detail"]
        mock_set_otp.assert_called_once()
        mock_send_sms.assert_not_called()  # Should not send SMS if Redis fails


def test_send_otp_sms_failure():
    """
    Test that endpoint raises a 500 error if the SMS utility fails to send.
    """
    payload = {"phone": "+919876543210"}
    
    with patch("app.api.v1.auth.set_otp_async", new_callable=AsyncMock) as mock_set_otp, \
         patch("app.api.v1.auth.send_sms", new_callable=AsyncMock, return_value=False) as mock_send_sms:
         
        mock_set_otp.return_value = True
         
        response = client.post("/api/v1/auth/send-otp", json=payload)
        
        assert response.status_code == 500
        data = response.json()
        assert "Failed to send OTP via SMS" in data["detail"]
        mock_set_otp.assert_called_once()
        mock_send_sms.assert_called_once()


@pytest.mark.parametrize("invalid_phone", [
    "",
    "123",              # Too short
    "+12345",           # Too short with +
    "abcdefghijklmnop", # Non-numeric characters
    "+91-9999-999-999-999-999-999-999", # Too long
])
def test_send_otp_validation_error(invalid_phone):
    """
    Test validation failure with malformed phone numbers.
    """
    payload = {"phone": invalid_phone}
    response = client.post("/api/v1/auth/send-otp", json=payload)
    assert response.status_code == 422


if __name__ == "__main__":
    # Allow executing the test file directly
    pytest.main([__file__, "-v"])
