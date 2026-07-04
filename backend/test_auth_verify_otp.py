import pytest
import sys
import os
import uuid
import jwt
from datetime import datetime
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.core.database import get_db
from app.models.user import User
from app.core.config import settings

# Create a mock database session
mock_db = MagicMock()

@pytest.fixture(scope="function", autouse=True)
def override_db_dependency():
    def override_get_db():
        try:
            yield mock_db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    yield
    if get_db in app.dependency_overrides:
        del app.dependency_overrides[get_db]

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_mock_db():
    mock_db.reset_mock()

def test_verify_otp_success_user_exists():
    """
    Test successful OTP verification when user exists in database.
    """
    payload = {
        "phone": "+919876543210",
        "otp": "123456"
    }
    
    # Mock user object
    user_id = uuid.uuid4()
    now = datetime.utcnow()
    mock_user = User(
        id=user_id,
        phone="+919876543210",
        role="client",
        email="john.doe@example.com",
        created_at=now,
        updated_at=now
    )
    
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user
    
    with patch("app.api.v1.auth.cache_get_async", new_callable=AsyncMock) as mock_get, \
         patch("app.api.v1.auth.cache_delete_async", new_callable=AsyncMock) as mock_delete:
        mock_get.return_value = {"otp": "123456"}
        mock_delete.return_value = True
         
        response = client.post("/api/v1/auth/verify-otp", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "OTP verified successfully." in data["message"]
        assert data["phone"] == "+919876543210"
        assert data["is_new_user"] is False
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        
        # Verify user details in response
        assert data["user"]["id"] == str(user_id)
        assert data["user"]["phone"] == "+919876543210"
        assert data["user"]["role"] == "client"
        
        # Verify JWT claims
        token = data["access_token"]
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert decoded["sub"] == str(user_id)
        assert decoded["phone"] == "+919876543210"
        assert decoded["role"] == "client"
        assert decoded["type"] == "access"
        assert "exp" in decoded
        
        mock_get.assert_called_once_with("otp:+919876543210")
        mock_delete.assert_called_once_with("otp:+919876543210")


def test_verify_otp_success_new_user():
    """
    Test successful OTP verification when user does not exist in database (is new user).
    """
    payload = {
        "phone": "+919876543210",
        "otp": "123456"
    }
    
    mock_db.query.return_value.filter.return_value.first.return_value = None
    
    with patch("app.api.v1.auth.cache_get_async", new_callable=AsyncMock) as mock_get, \
         patch("app.api.v1.auth.cache_delete_async", new_callable=AsyncMock) as mock_delete:
        mock_get.return_value = {"otp": "123456"}
        mock_delete.return_value = True
         
        response = client.post("/api/v1/auth/verify-otp", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "OTP verified successfully." in data["message"]
        assert data["phone"] == "+919876543210"
        assert data["is_new_user"] is True
        assert data["access_token"] is None
        assert data["token_type"] is None
        assert data["user"] is None
        
        mock_get.assert_called_once_with("otp:+919876543210")
        mock_delete.assert_called_once_with("otp:+919876543210")


def test_verify_otp_expired():
    """
    Test failure when OTP has expired or does not exist in Redis.
    """
    payload = {
        "phone": "+919876543210",
        "otp": "123456"
    }
    
    # Mock cache_get_async returning None
    with patch("app.api.v1.auth.cache_get_async", new_callable=AsyncMock) as mock_get, \
         patch("app.api.v1.auth.cache_delete_async", new_callable=AsyncMock) as mock_delete:
        mock_get.return_value = None
        mock_delete.return_value = True
         
        response = client.post("/api/v1/auth/verify-otp", json=payload)
        
        assert response.status_code == 400
        data = response.json()
        assert "expired or does not exist" in data["detail"]
        
        mock_get.assert_called_once_with("otp:+919876543210")
        mock_delete.assert_not_called()


def test_verify_otp_invalid():
    """
    Test failure when OTP is incorrect (does not match stored value).
    """
    payload = {
        "phone": "+919876543210",
        "otp": "123456"
    }
    
    # Mock cache_get_async returning non-matching OTP
    with patch("app.api.v1.auth.cache_get_async", new_callable=AsyncMock) as mock_get, \
         patch("app.api.v1.auth.cache_delete_async", new_callable=AsyncMock) as mock_delete:
        mock_get.return_value = {"otp": "654321"}
        mock_delete.return_value = True
         
        response = client.post("/api/v1/auth/verify-otp", json=payload)
        
        assert response.status_code == 400
        data = response.json()
        assert "Invalid OTP." in data["detail"]
        
        mock_get.assert_called_once_with("otp:+919876543210")
        mock_delete.assert_not_called()


@pytest.mark.parametrize("invalid_phone, invalid_otp", [
    ("", "123456"),
    ("123", "123456"),
    ("+919876543210", ""),
    ("+919876543210", "12345"),      # Too short
    ("+919876543210", "1234567"),    # Too long
    ("+919876543210", "abcdef"),     # Non-numeric
])
def test_verify_otp_validation_error(invalid_phone, invalid_otp):
    """
    Test validation failure with malformed inputs.
    """
    payload = {
        "phone": invalid_phone,
        "otp": invalid_otp
    }
    response = client.post("/api/v1/auth/verify-otp", json=payload)
    assert response.status_code == 422


def test_verify_firebase_token_user_exists():
    """
    Test Firebase ID token verification when the user already exists in the database.
    """
    payload = {
        "phone": "+919876543210",
        "otp": "eyJ-mock-firebase-token-+919876543210"
    }
    
    user_id = uuid.uuid4()
    now = datetime.utcnow()
    mock_user = User(
        id=user_id,
        phone="+919876543210",
        role="client",
        email="existing.firebase@example.com",
        created_at=now,
        updated_at=now
    )
    
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user
    
    response = client.post("/api/v1/auth/verify-otp", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["phone"] == "+919876543210"
    assert data["is_new_user"] is False
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["id"] == str(user_id)


def test_verify_firebase_token_new_user():
    """
    Test Firebase ID token verification when the user is new (auto-registered).
    """
    payload = {
        "phone": "+919876543210",
        "otp": "eyJ-mock-firebase-token-+919876543210"
    }
    
    # First time returns None (user doesn't exist)
    # After add/commit, we query again and mock it returning the created user
    user_id = uuid.uuid4()
    now = datetime.utcnow()
    created_user = User(
        id=user_id,
        phone="+919876543210",
        role="client",
        email="user_919876543210@urbanpower.com",
        created_at=now,
        updated_at=now
    )
    
    mock_db.query.return_value.filter.return_value.first.side_effect = [None, created_user]
    
    # Mock refresh to populate the fields on the user instance created inside the endpoint
    def perform_refresh(obj):
        obj.id = user_id
        obj.created_at = now
        obj.updated_at = now
    mock_db.refresh.side_effect = perform_refresh
    
    response = client.post("/api/v1/auth/verify-otp", json=payload)
    
    # Reset mock refresh side_effect
    mock_db.refresh.side_effect = None
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["phone"] == "+919876543210"
    assert data["is_new_user"] is True
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["phone"] == "+919876543210"
    
    # Reset side_effect for other tests
    mock_db.query.return_value.filter.return_value.first.side_effect = None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
