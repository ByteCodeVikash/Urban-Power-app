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
from app.models.scrap import ScrapCategory, ScrapItem
from app.core.seeding import seed_scrap_data

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """
    Runs each test inside a database transaction, rolling back changes.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    # Pre-seed the scrap data for testing since the DB tables are transactional
    seed_scrap_data(session)
    
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
    Tests that we can successfully fetch seeded scrap categories.
    """
    response = client.get("/api/v1/scrap/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    
    # Check that categories contain expected properties and nested items
    first_cat = data[0]
    assert "id" in first_cat
    assert "name" in first_cat
    assert "active" in first_cat
    assert first_cat["active"] is True
    assert "items" in first_cat
    assert len(first_cat["items"]) > 0
    
    first_item = first_cat["items"][0]
    assert "id" in first_item
    assert "price_per_kg" in first_item
    assert first_item["price_per_kg"] > 0

def test_get_item_details_success(client, db_session):
    """
    Tests fetching details of a specific scrap item.
    """
    # Fetch categories to get a valid item ID
    response = client.get("/api/v1/scrap/categories")
    categories = response.json()
    item_id = categories[0]["items"][0]["id"]
    
    response = client.get(f"/api/v1/scrap/items/{item_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == item_id
    assert "name" in data
    assert "price_per_kg" in data

def test_get_item_details_not_found(client, db_session):
    """
    Tests that fetching a non-existent item ID returns 404.
    """
    random_uuid = str(uuid.uuid4())
    response = client.get(f"/api/v1/scrap/items/{random_uuid}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Scrap item not found or inactive"
