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
from app.models.address import Address
from app.core.security import create_access_token

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
        email="address.test.user@example.com",
        full_name="Address Test User",
        phone="+919999999990",
        role="client",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def other_user(db_session):
    """
    Fixture to create and return a second active user.
    """
    user = User(
        email="address.other.user@example.com",
        full_name="Other User",
        phone="+919999999991",
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

def test_create_first_address_auto_default(client, auth_headers, db_session, active_user):
    """
    Tests that the first saved address is automatically marked as default.
    """
    payload = {
        "address_type": "Home",
        "house_number": "Flat 402",
        "landmark": "Near Central Mall",
        "street": "12 Main Road",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "latitude": 19.076,
        "longitude": 72.8777,
        "is_default": False
    }

    response = client.post("/api/v1/addresses/", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["house_number"] == "Flat 402"
    assert data["pincode"] == "400001"
    # Even though is_default was requested as False, it should be True since it's the first address
    assert data["is_default"] is True
    assert data["user_id"] == str(active_user.id)

def test_create_subsequent_addresses_default_switching(client, auth_headers, db_session, active_user):
    """
    Tests that saving a new default address marks the old default address as non-default.
    """
    # Create first address (will be default)
    addr1 = Address(
        user_id=active_user.id,
        address_type="Home",
        street="12 Main Road",
        city="Mumbai",
        state="Maharashtra",
        pincode="400001",
        is_default=True
    )
    db_session.add(addr1)
    db_session.commit()

    payload = {
        "address_type": "Work",
        "street": "24 Corporate Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400002",
        "is_default": True
    }

    response = client.post("/api/v1/addresses/", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["is_default"] is True
    
    # Reload first address and check if it is no longer default
    db_session.refresh(addr1)
    assert addr1.is_default is False

def test_list_addresses_ordered(client, auth_headers, db_session, active_user):
    """
    Tests that addresses are returned ordered with default first.
    """
    addr1 = Address(
        user_id=active_user.id,
        address_type="Home",
        street="12 Main Road",
        city="Mumbai",
        state="Maharashtra",
        pincode="400001",
        is_default=False
    )
    addr2 = Address(
        user_id=active_user.id,
        address_type="Work",
        street="24 Corporate Street",
        city="Mumbai",
        state="Maharashtra",
        pincode="400002",
        is_default=True
    )
    db_session.add_all([addr1, addr2])
    db_session.commit()

    response = client.get("/api/v1/addresses/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    # Default address (Work) must be first
    assert data[0]["address_type"] == "Work"
    assert data[0]["is_default"] is True
    assert data[1]["address_type"] == "Home"
    assert data[1]["is_default"] is False

def test_update_address_fields_and_default(client, auth_headers, db_session, active_user):
    """
    Tests updating an address and toggling default status.
    """
    addr1 = Address(
        user_id=active_user.id,
        address_type="Home",
        street="12 Main Road",
        city="Mumbai",
        state="Maharashtra",
        pincode="400001",
        is_default=True
    )
    addr2 = Address(
        user_id=active_user.id,
        address_type="Work",
        street="24 Corporate Street",
        city="Mumbai",
        state="Maharashtra",
        pincode="400002",
        is_default=False
    )
    db_session.add_all([addr1, addr2])
    db_session.commit()
    db_session.refresh(addr2)

    # Update addr2 to be default and change street name
    payload = {
        "street": "55 Tech Plaza",
        "is_default": True
    }
    response = client.put(f"/api/v1/addresses/{addr2.id}", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["street"] == "55 Tech Plaza"
    assert data["is_default"] is True

    # Check if addr1 is no longer default
    db_session.refresh(addr1)
    assert addr1.is_default is False

def test_delete_address_and_auto_default_reassign(client, auth_headers, db_session, active_user):
    """
    Tests that deleting the default address automatically makes another address default.
    """
    addr1 = Address(
        user_id=active_user.id,
        address_type="Home",
        street="12 Main Road",
        city="Mumbai",
        state="Maharashtra",
        pincode="400001",
        is_default=True
    )
    addr2 = Address(
        user_id=active_user.id,
        address_type="Work",
        street="24 Corporate Street",
        city="Mumbai",
        state="Maharashtra",
        pincode="400002",
        is_default=False
    )
    db_session.add_all([addr1, addr2])
    db_session.commit()
    db_session.refresh(addr1)
    db_session.refresh(addr2)

    response = client.delete(f"/api/v1/addresses/{addr1.id}", headers=auth_headers)
    assert response.status_code == 204

    # Check if addr2 was automatically promoted to default
    db_session.refresh(addr2)
    assert addr2.is_default is True

def test_cannot_access_other_user_address(client, auth_headers, db_session, other_user):
    """
    Tests that a user cannot retrieve, update, or delete addresses belonging to other users.
    """
    other_addr = Address(
        user_id=other_user.id,
        address_type="Home",
        street="Other Street",
        city="Pune",
        state="Maharashtra",
        pincode="411001",
        is_default=True
    )
    db_session.add(other_addr)
    db_session.commit()
    db_session.refresh(other_addr)

    # Try to GET
    response = client.get(f"/api/v1/addresses/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    # Should not see other_user's address
    assert len(data) == 0

    # Try to PUT
    payload = {"street": "Hacked Street"}
    response = client.put(f"/api/v1/addresses/{other_addr.id}", json=payload, headers=auth_headers)
    assert response.status_code == 404

    # Try to DELETE
    response = client.delete(f"/api/v1/addresses/{other_addr.id}", headers=auth_headers)
    assert response.status_code == 404

def test_validation_invalid_pincode(client, auth_headers):
    """
    Tests that invalid pincode formats are rejected with 422.
    """
    payload = {
        "address_type": "Home",
        "street": "12 Main Road",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "invalid_pincode_too_long_123456",
        "is_default": False
    }
    response = client.post("/api/v1/addresses/", json=payload, headers=auth_headers)
    assert response.status_code == 422

def test_validation_invalid_coordinates(client, auth_headers):
    """
    Tests that coordinates outside valid ranges are rejected with 422.
    """
    payload = {
        "address_type": "Home",
        "street": "12 Main Road",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "latitude": 95.0, # Latitude > 90
        "longitude": 72.8,
        "is_default": False
    }
    response = client.post("/api/v1/addresses/", json=payload, headers=auth_headers)
    assert response.status_code == 422
