import pytest
import sys
import os
import uuid
import jwt
from datetime import datetime
from unittest.mock import patch, MagicMock
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
    mock_db.query.return_value.filter.return_value.first.side_effect = None
    mock_db.query.return_value.filter.return_value.first.return_value = None


def test_google_login_success_existing_user():
    """
    Test successful Google login when the user already exists in the database.
    """
    token = "google-mock-testgoogle@urbanpower.com-John_Doe-https://example.com/john.jpg"
    payload = {"id_token": token}
    
    user_id = uuid.uuid4()
    now = datetime.utcnow()
    mock_user = User(
        id=user_id,
        email="testgoogle@urbanpower.com",
        full_name="John Doe",
        profile_image="https://example.com/john.jpg",
        role="client",
        is_active=True,
        is_verified=True,
        created_at=now,
        updated_at=now
    )
    
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user
    
    response = client.post("/api/v1/auth/google-login", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "login successful" in data["message"]
    assert data["is_new_user"] is False
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    
    # Verify user details in response
    assert data["user"]["id"] == str(user_id)
    assert data["user"]["email"] == "testgoogle@urbanpower.com"
    assert data["user"]["full_name"] == "John Doe"
    assert data["user"]["profile_image"] == "https://example.com/john.jpg"
    assert data["user"]["role"] == "client"
    
    # Verify JWT claims
    decoded = jwt.decode(data["access_token"], settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert decoded["sub"] == str(user_id)
    assert decoded["role"] == "client"
    assert decoded["type"] == "access"


def test_google_login_success_new_user():
    """
    Test successful Google login when user does not exist (auto-registration).
    """
    token = "google-mock-newuser@urbanpower.com-Alice_Smith-https://example.com/alice.jpg"
    payload = {"id_token": token}
    
    user_id = uuid.uuid4()
    now = datetime.utcnow()
    created_user = User(
        id=user_id,
        email="newuser@urbanpower.com",
        full_name="Alice Smith",
        profile_image="https://example.com/alice.jpg",
        role="client",
        is_active=True,
        is_verified=True,
        created_at=now,
        updated_at=now
    )
    
    # First query (check user exists) returns None, second query (after db.refresh) returns the user
    mock_db.query.return_value.filter.return_value.first.side_effect = [None, created_user]
    
    # Mock refresh to populate the fields on the user instance created inside the endpoint
    def perform_refresh(obj):
        obj.id = user_id
        obj.created_at = now
        obj.updated_at = now
    mock_db.refresh.side_effect = perform_refresh
    
    response = client.post("/api/v1/auth/google-login", json=payload)
    
    # Reset mock refresh side_effect
    mock_db.refresh.side_effect = None
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "registration successful" in data["message"]
    assert data["is_new_user"] is True
    assert "access_token" in data
    assert data["user"]["email"] == "newuser@urbanpower.com"
    assert data["user"]["full_name"] == "Alice Smith"
    
    # Verify DB commands were called
    assert mock_db.add.called
    assert mock_db.commit.called
    assert mock_db.refresh.called


def test_google_login_inactive_user():
    """
    Test failure when an existing user account is inactive.
    """
    token = "google-mock-inactive@urbanpower.com-Inactive_User"
    payload = {"id_token": token}
    
    user_id = uuid.uuid4()
    now = datetime.utcnow()
    mock_user = User(
        id=user_id,
        email="inactive@urbanpower.com",
        full_name="Inactive User",
        role="client",
        is_active=False,
        is_verified=True,
        created_at=now,
        updated_at=now
    )
    
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user
    
    response = client.post("/api/v1/auth/google-login", json=payload)
    
    assert response.status_code == 400
    data = response.json()
    assert "Inactive user account" in data["detail"]


@patch("app.api.v1.auth.settings")
def test_google_login_no_client_ids_configured(mock_settings):
    """
    Test internal server error when google authentication is not configured in settings and a live token verification is attempted.
    """
    # Force SMS_MOCK to False, and clear all GOOGLE client IDs
    mock_settings.SMS_MOCK = False
    mock_settings.GOOGLE_CLIENT_ID = None
    mock_settings.GOOGLE_ANDROID_CLIENT_ID = None
    mock_settings.GOOGLE_IOS_CLIENT_ID = None
    
    payload = {"id_token": "some-live-looking-token"}
    
    response = client.post("/api/v1/auth/google-login", json=payload)
    
    assert response.status_code == 500
    data = response.json()
    assert "Google Authentication is not configured" in data["detail"]


@patch("app.api.v1.auth.settings")
@patch("app.api.v1.auth.id_token.verify_oauth2_token")
def test_google_login_invalid_token_signature(mock_verify, mock_settings):
    """
    Test 401 unauthorized when the Google ID token verification fails signature validation.
    """
    # Force SMS_MOCK to False, but configure client IDs
    mock_settings.SMS_MOCK = False
    mock_settings.GOOGLE_CLIENT_ID = "mock-client-id-123"
    mock_settings.GOOGLE_ANDROID_CLIENT_ID = None
    mock_settings.GOOGLE_IOS_CLIENT_ID = None
    
    # Mock verify_oauth2_token raising ValueError (invalid signature/structure)
    mock_verify.side_effect = ValueError("Invalid signature")
    
    payload = {"id_token": "invalid-token-signature"}
    
    response = client.post("/api/v1/auth/google-login", json=payload)
    
    assert response.status_code == 401
    data = response.json()
    assert "Invalid Google token structure or signature" in data["detail"]


@patch("app.api.v1.auth.settings")
@patch("app.api.v1.auth.id_token.verify_oauth2_token")
def test_google_login_revoked_token(mock_verify, mock_settings):
    """
    Test 401 unauthorized when the Google ID token is revoked or expired.
    """
    from google.auth.exceptions import GoogleAuthError
    
    # Force SMS_MOCK to False, but configure client IDs
    mock_settings.SMS_MOCK = False
    mock_settings.GOOGLE_CLIENT_ID = "mock-client-id-123"
    mock_settings.GOOGLE_ANDROID_CLIENT_ID = None
    mock_settings.GOOGLE_IOS_CLIENT_ID = None
    
    # Mock verify_oauth2_token raising GoogleAuthError (token revoked/expired)
    mock_verify.side_effect = GoogleAuthError("Token has been revoked")
    
    payload = {"id_token": "revoked-token"}
    
    response = client.post("/api/v1/auth/google-login", json=payload)
    
    assert response.status_code == 401
    data = response.json()
    assert "Google token verification failed: Token has been revoked" in data["detail"]
