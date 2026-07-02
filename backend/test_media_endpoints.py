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
from app.core.security import create_access_token
from app.core.config import settings

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
    if get_db in app.dependency_overrides:
        del app.dependency_overrides[get_db]

@pytest.fixture(scope="function")
def active_user(db_session):
    """
    Fixture to create and return an active authenticated user.
    """
    user = User(
        email="media.test.user@example.com",
        full_name="Media Test User",
        phone="+918888888880",
        role="client",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def auth_headers(active_user):
    """
    Fixture to generate authorization headers for the active user.
    """
    token = create_access_token(user_id=str(active_user.id), phone=active_user.phone, role=active_user.role)
    return {"Authorization": f"Bearer {token}"}

def test_upload_image_success(client, auth_headers):
    """
    Tests uploading a valid image file.
    """
    file_content = b"fake-png-content"
    files = {"file": ("avatar.png", file_content, "image/png")}
    
    response = client.post("/api/v1/media/upload", files=files, headers=auth_headers)
    assert response.status_code == 201
    
    data = response.json()
    assert "file_url" in data
    assert data["file_name"] == "avatar.png"
    assert data["content_type"] == "image/png"
    assert data["size"] == len(file_content)
    # Ensure the URL is absolute and refers to our mounted static endpoint
    assert "/media/" in data["file_url"]

def test_upload_document_success(client, auth_headers):
    """
    Tests uploading a valid document file.
    """
    file_content = b"fake-pdf-content"
    files = {"file": ("resume.pdf", file_content, "application/pdf")}
    
    response = client.post("/api/v1/media/upload", files=files, headers=auth_headers)
    assert response.status_code == 201
    
    data = response.json()
    assert "file_url" in data
    assert data["file_name"] == "resume.pdf"
    assert data["content_type"] == "application/pdf"
    assert data["size"] == len(file_content)

def test_upload_unauthorized(client):
    """
    Tests that uploading a file without authorization headers is rejected with 401.
    """
    files = {"file": ("avatar.png", b"content", "image/png")}
    response = client.post("/api/v1/media/upload", files=files)
    assert response.status_code == 401

def test_upload_invalid_extension(client, auth_headers):
    """
    Tests that files with unsupported extensions are rejected.
    """
    files = {"file": ("malicious.exe", b"content", "image/png")}
    response = client.post("/api/v1/media/upload", files=files, headers=auth_headers)
    assert response.status_code == 400
    assert "Unsupported file extension" in response.json()["detail"]

def test_upload_invalid_mime(client, auth_headers):
    """
    Tests that files with mismatched or unsupported MIME types are rejected.
    """
    files = {"file": ("avatar.png", b"content", "application/octet-stream")}
    response = client.post("/api/v1/media/upload", files=files, headers=auth_headers)
    assert response.status_code == 400
    assert "Unsupported file MIME type" in response.json()["detail"]

def test_upload_too_large(client, auth_headers, monkeypatch):
    """
    Tests that files exceeding the maximum size limit are rejected with 413.
    """
    # Force max upload size to be 0MB for testing
    monkeypatch.setattr(settings, "MAX_UPLOAD_SIZE_MB", 0)
    
    files = {"file": ("avatar.png", b"some content", "image/png")}
    response = client.post("/api/v1/media/upload", files=files, headers=auth_headers)
    
    assert response.status_code == 413
    assert "exceeds the maximum limit" in response.json()["detail"]
