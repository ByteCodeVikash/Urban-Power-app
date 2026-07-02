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
from app.models.maintenance import MaintenanceCategory, MaintenanceService
from app.core.seeding import seed_maintenance_data

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """
    Runs each test inside a database transaction, rolling back changes.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    # Pre-seed the maintenance data for testing since the DB tables are transactional
    seed_maintenance_data(session)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    """
    Overrides the get_db dependency.
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

def test_get_categories_success(client, db_session):
    """
    Tests that we can successfully fetch seeded maintenance categories.
    """
    response = client.get("/api/v1/maintenance/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    
    # Check that categories contain expected properties and nested services
    first_cat = data[0]
    assert "id" in first_cat
    assert "name" in first_cat
    assert "icon" in first_cat
    assert "image" in first_cat
    assert "description" in first_cat
    assert "active" in first_cat
    assert first_cat["active"] is True
    assert "services" in first_cat
    assert len(first_cat["services"]) > 0
    
    first_service = first_cat["services"][0]
    assert "id" in first_service
    assert "category_id" in first_service
    assert "name" in first_service
    assert "image" in first_service
    assert "description" in first_service
    assert "duration" in first_service
    assert "price" in first_service
    assert "active" in first_service
    assert first_service["active"] is True

def test_get_services_success(client, db_session):
    """
    Tests fetching all maintenance services.
    """
    response = client.get("/api/v1/maintenance/services")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    
    first_service = data[0]
    assert "id" in first_service
    assert "price" in first_service
    assert first_service["price"] > 0
    assert "duration" in first_service
    assert first_service["duration"] > 0

def test_get_services_filtered_by_category(client, db_session):
    """
    Tests fetching maintenance services filtered by category_id.
    """
    # Fetch categories first to get a valid category ID
    response = client.get("/api/v1/maintenance/categories")
    categories = response.json()
    cat_id = categories[0]["id"]
    cat_services_count = len(categories[0]["services"])
    
    # Get services filtered by this category
    response = client.get(f"/api/v1/maintenance/services?category_id={cat_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == cat_services_count
    for svc in data:
        assert svc["category_id"] == cat_id

def test_get_services_empty_category(client, db_session):
    """
    Tests filtering services with a non-existent category ID returns empty list.
    """
    random_uuid = str(uuid.uuid4())
    response = client.get(f"/api/v1/maintenance/services?category_id={random_uuid}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0
