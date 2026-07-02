import pytest
import sys
import os
import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.core.database import get_db, engine
from app.models.user import User

# Create a sessionmaker bound to the existing engine
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """
    Fixture that runs each test inside a database transaction, 
    rolling back all changes after the test finishes.
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
    Fixture that overrides the get_db dependency to use the transactional test session.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_create_user_success(client):
    """
    Test successful user creation with valid payload.
    """
    payload = {
        "email": "john.doe@example.com",
        "full_name": "John Doe",
        "phone": "+1234567890",
        "role": "client"
    }
    
    response = client.post("/api/v1/users/", json=payload)
    assert response.status_code == 201
    
    data = response.json()
    assert "id" in data
    assert data["email"] == "john.doe@example.com"
    assert data["full_name"] == "John Doe"
    assert data["phone"] == "+1234567890"
    assert data["role"] == "client"
    assert data["is_active"] is True
    assert data["is_verified"] is False
    assert "created_at" in data
    assert "updated_at" in data

def test_create_user_email_exists(client, db_session):
    """
    Test user creation fails when email is already registered.
    """
    # Pre-create user in the transactional database session
    existing_user = User(
        email="duplicate.email@example.com",
        full_name="Existing User",
        phone="+1987654321",
        role="client"
    )
    db_session.add(existing_user)
    db_session.commit()
    
    payload = {
        "email": "duplicate.email@example.com",
        "full_name": "New User",
        "phone": "+1555555555",
        "role": "client"
    }
    
    response = client.post("/api/v1/users/", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Email already registered"

def test_create_user_phone_exists(client, db_session):
    """
    Test user creation fails when phone is already registered.
    """
    # Pre-create user in the transactional database session
    existing_user = User(
        email="original.email@example.com",
        full_name="Existing User",
        phone="+1987654321",
        role="client"
    )
    db_session.add(existing_user)
    db_session.commit()
    
    payload = {
        "email": "new.email@example.com",
        "full_name": "New User",
        "phone": "+1987654321",
        "role": "client"
    }
    
    response = client.post("/api/v1/users/", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Phone number already registered"

def test_create_user_validation_error_email(client):
    """
    Test validation fails when email format is invalid.
    """
    payload = {
        "email": "not-an-email",
        "full_name": "Test User",
        "phone": "+1234567890",
        "role": "client"
    }
    
    response = client.post("/api/v1/users/", json=payload)
    assert response.status_code == 422

def test_create_user_validation_error_phone(client):
    """
    Test validation fails when phone number format is invalid.
    """
    payload = {
        "email": "test@example.com",
        "full_name": "Test User",
        "phone": "invalid-phone-format",
        "role": "client"
    }
    
    response = client.post("/api/v1/users/", json=payload)
    assert response.status_code == 422


def test_get_user_success(client, db_session):
    """
    Test getting a user by ID successfully.
    """
    db_user = User(
        email="get.user.success@example.com",
        full_name="Get User Success",
        phone="+1112223333",
        role="client"
    )
    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)

    response = client.get(f"/api/v1/users/{db_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(db_user.id)
    assert data["email"] == "get.user.success@example.com"
    assert data["full_name"] == "Get User Success"
    assert data["phone"] == "+1112223333"


def test_get_user_not_found(client):
    """
    Test getting a non-existent user returns 404.
    """
    non_existent_uuid = uuid.uuid4()
    response = client.get(f"/api/v1/users/{non_existent_uuid}")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "User not found"


def test_update_user_full_success(client, db_session):
    """
    Test successful full update of a user.
    """
    db_user = User(
        email="original.update@example.com",
        full_name="Original Name",
        phone="+12003004000",
        role="client",
        profile_image="http://example.com/original.jpg"
    )
    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)

    payload = {
        "email": "new.update@example.com",
        "full_name": "New Name",
        "phone": "+19998887777",
        "profile_image": "http://example.com/new.png",
        "role": "provider",
        "is_active": False,
        "is_verified": True
    }

    response = client.put(f"/api/v1/users/{db_user.id}", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(db_user.id)
    assert data["email"] == "new.update@example.com"
    assert data["full_name"] == "New Name"
    assert data["phone"] == "+19998887777"
    assert data["profile_image"] == "http://example.com/new.png"
    assert data["role"] == "provider"
    assert data["is_active"] is False
    assert data["is_verified"] is True


def test_update_user_partial_success(client, db_session):
    """
    Test successful partial update of a user.
    """
    db_user = User(
        email="partial.update@example.com",
        full_name="Original Name",
        phone="+13004005000",
        role="client",
        profile_image="http://example.com/original.jpg"
    )
    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)

    payload = {
        "full_name": "Partially Updated Name"
    }

    response = client.put(f"/api/v1/users/{db_user.id}", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(db_user.id)
    assert data["full_name"] == "Partially Updated Name"
    # email and phone should remain original
    assert data["email"] == "partial.update@example.com"
    assert data["phone"] == "+13004005000"
    assert data["profile_image"] == "http://example.com/original.jpg"


def test_update_user_email_exists(client, db_session):
    """
    Test user update fails when target email is already registered to another user.
    """
    user1 = User(
        email="user1@example.com",
        full_name="User One",
        phone="+14005006000",
        role="client"
    )
    user2 = User(
        email="user2@example.com",
        full_name="User Two",
        phone="+15006007000",
        role="client"
    )
    db_session.add_all([user1, user2])
    db_session.commit()

    payload = {
        "email": "user1@example.com"
    }

    response = client.put(f"/api/v1/users/{user2.id}", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Email already registered"


def test_update_user_phone_exists(client, db_session):
    """
    Test user update fails when target phone is already registered to another user.
    """
    user1 = User(
        email="user1@example.com",
        full_name="User One",
        phone="+14005006000",
        role="client"
    )
    user2 = User(
        email="user2@example.com",
        full_name="User Two",
        phone="+15006007000",
        role="client"
    )
    db_session.add_all([user1, user2])
    db_session.commit()

    payload = {
        "phone": "+14005006000"
    }

    response = client.put(f"/api/v1/users/{user2.id}", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Phone number already registered"


def test_update_user_own_values(client, db_session):
    """
    Test user update succeeds when updating fields to user's own current values.
    """
    db_user = User(
        email="own.values@example.com",
        full_name="Own User",
        phone="+16007008000",
        role="client"
    )
    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)

    payload = {
        "email": "own.values@example.com",
        "phone": "+16007008000"
    }

    response = client.put(f"/api/v1/users/{db_user.id}", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "own.values@example.com"
    assert data["phone"] == "+16007008000"


def test_update_user_not_found(client):
    """
    Test updating a non-existent user returns 404.
    """
    non_existent_uuid = uuid.uuid4()
    payload = {
        "full_name": "Non-existent User"
    }
    response = client.put(f"/api/v1/users/{non_existent_uuid}", json=payload)
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "User not found"


def test_update_user_validation_error_email(client, db_session):
    """
    Test validation fails when email format is invalid.
    """
    db_user = User(
        email="valid@example.com",
        full_name="Valid User",
        role="client"
    )
    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)

    payload = {
        "email": "not-an-email"
    }
    response = client.put(f"/api/v1/users/{db_user.id}", json=payload)
    assert response.status_code == 422


def test_update_user_validation_error_phone(client, db_session):
    """
    Test validation fails when phone number format is invalid.
    """
    db_user = User(
        email="valid@example.com",
        full_name="Valid User",
        role="client"
    )
    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)

    payload = {
        "phone": "invalid-phone"
    }
    response = client.put(f"/api/v1/users/{db_user.id}", json=payload)
    assert response.status_code == 422


