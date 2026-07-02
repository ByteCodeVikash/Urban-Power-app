import pytest
import sys
import os
import uuid
from datetime import timedelta
import jwt
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.core.database import get_db, engine
from app.models.user import User
from app.core.security import create_access_token, create_refresh_token, settings

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """
    Runs each test inside a transaction and rolls it back.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    """
    Overrides get_db dependency.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    if get_db in app.dependency_overrides:
        del app.dependency_overrides[get_db]

def test_access_and_refresh_token_generation_in_verify_otp(client, db_session):
    # Create user
    user = User(
        email="test_otp_verify@example.com",
        full_name="OTP Verify User",
        phone="+919999999999",
        role="client",
        is_active=True,
        is_verified=True
    )
    db_session.add(user)
    db_session.commit()
    
    # We bypass actual Redis verify by sending a mock Firebase token starting with eyJ-mock
    # verify_otp has: if settings.SMS_MOCK or payload.otp.startswith("eyJ-mock"): is_verified = True
    payload = {
        "phone": "+919999999999",
        "otp": "eyJ-mockTokenForTesting"
    }
    
    response = client.post("/api/v1/auth/verify-otp", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["access_token"] is not None
    assert data["refresh_token"] is not None
    assert data["token_type"] == "bearer"
    assert data["user"]["id"] == str(user.id)

def test_get_current_user_profile_success(client, db_session):
    # Pre-create active user
    user = User(
        email="active.user@example.com",
        full_name="Active User",
        phone="+919999999998",
        role="client",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Generate token
    token = create_access_token(user_id=str(user.id), phone=user.phone, role=user.role)

    # Call /users/me
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/users/me", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "active.user@example.com"
    assert data["full_name"] == "Active User"
    assert data["id"] == str(user.id)

def test_get_current_user_profile_invalid_token(client):
    headers = {"Authorization": "Bearer invalidtokenhere"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials"

def test_get_current_user_profile_expired_token(client, db_session):
    # Pre-create active user
    user = User(
        email="expired.user@example.com",
        full_name="Expired User",
        phone="+919999999997",
        role="client",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Generate expired token by setting negative expires_delta
    token = create_access_token(
        user_id=str(user.id),
        phone=user.phone,
        role=user.role,
        expires_delta=timedelta(minutes=-1)
    )

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 401
    assert response.json()["detail"] == "Token expired"

def test_get_current_user_profile_missing_token(client):
    response = client.get("/api/v1/users/me")
    assert response.status_code in (401, 403)  # HTTPBearer auto-error=True raises 401 or 403

def test_get_current_user_profile_inactive_user(client, db_session):
    # Pre-create inactive user
    user = User(
        email="inactive.user@example.com",
        full_name="Inactive User",
        phone="+919999999996",
        role="client",
        is_active=False
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(user_id=str(user.id), phone=user.phone, role=user.role)

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/users/me", headers=headers)
    
    assert response.status_code == 400
    assert response.json()["detail"] == "Inactive user"

def test_token_refresh_success(client, db_session):
    # Pre-create user
    user = User(
        email="refresh.success@example.com",
        full_name="Refresh Success User",
        phone="+919999999995",
        role="client",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    refresh_token = create_refresh_token(user_id=str(user.id), phone=user.phone, role=user.role)

    response = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

    # Decode and check claims of new tokens
    access_payload = jwt.decode(
        data["access_token"], settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
    )
    assert access_payload["sub"] == str(user.id)
    assert access_payload["type"] == "access"

    refresh_payload = jwt.decode(
        data["refresh_token"], settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
    )
    assert refresh_payload["sub"] == str(user.id)
    assert refresh_payload["type"] == "refresh"

def test_token_refresh_using_access_token_fails(client, db_session):
    user = User(
        email="refresh.fail@example.com",
        full_name="Refresh Fail User",
        phone="+919999999994",
        role="client",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    access_token = create_access_token(user_id=str(user.id), phone=user.phone, role=user.role)

    # Calling refresh with an access token
    response = client.post("/api/v1/auth/refresh", json={"refresh_token": access_token})
    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials"

def test_token_refresh_expired_token(client, db_session):
    user = User(
        email="refresh.expired@example.com",
        full_name="Refresh Expired User",
        phone="+919999999993",
        role="client",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    refresh_token = create_refresh_token(
        user_id=str(user.id),
        phone=user.phone,
        role=user.role,
        expires_delta=timedelta(minutes=-1)
    )

    response = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 401
    assert response.json()["detail"] == "Token expired"


def test_openapi_security_scheme(client):
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "components" in data
    assert "securitySchemes" in data["components"]
    
    schemes = data["components"]["securitySchemes"]
    assert "HTTPBearer" in schemes
    assert schemes["HTTPBearer"]["type"] == "http"
    assert schemes["HTTPBearer"]["scheme"] == "bearer"

