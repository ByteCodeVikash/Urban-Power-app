import pytest
import sys
import os
import unittest.mock as mock
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.core.database import get_db, engine
from app.models.user import User
from app.models.address import Address
from app.core.security import create_access_token
from app.services.geocoding import geocoding_service
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
        email="geocoding.test.user@example.com",
        full_name="Geocoding Test User",
        phone="+919999999999",
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

# ==========================================
# SERVICE UNIT TESTS (MOCK FALLBACK MODE)
# ==========================================

def test_service_mock_geocode():
    """
    Test geocoding service in mock mode.
    """
    # Ensure mock mode is active
    original_mock = settings.GOOGLE_MAPS_MOCK
    settings.GOOGLE_MAPS_MOCK = True
    
    try:
        # Mumbai match
        res = geocoding_service.geocode_address("Gateway of India, Mumbai")
        assert res is not None
        assert res["latitude"] == 19.0760
        assert res["longitude"] == 72.8777
        assert "Mumbai" in res["formatted_address"]
        
        # Delhi match
        res = geocoding_service.geocode_address("Delhi Metro station")
        assert res is not None
        assert res["latitude"] == 28.6139
        assert res["longitude"] == 77.2090
        
        # Default match
        res = geocoding_service.geocode_address("Some Random Street, France")
        assert res is not None
        assert res["latitude"] == 19.0760
        assert res["longitude"] == 72.8777
    finally:
        settings.GOOGLE_MAPS_MOCK = original_mock

def test_service_mock_reverse_geocode():
    """
    Test reverse geocoding service in mock mode.
    """
    original_mock = settings.GOOGLE_MAPS_MOCK
    settings.GOOGLE_MAPS_MOCK = True
    
    try:
        # Mumbai coordinates
        res = geocoding_service.reverse_geocode_coordinates(19.05, 72.85)
        assert res is not None
        assert res["city"] == "Mumbai"
        assert res["pincode"] == "400001"
        
        # Delhi coordinates
        res = geocoding_service.reverse_geocode_coordinates(28.6, 77.2)
        assert res is not None
        assert res["city"] == "New Delhi"
        assert res["pincode"] == "110001"
        
        # Default coordinates
        res = geocoding_service.reverse_geocode_coordinates(10.0, 20.0)
        assert res is not None
        assert res["city"] == "Bangalore"
        assert res["pincode"] == "560001"
    finally:
        settings.GOOGLE_MAPS_MOCK = original_mock

# ==========================================
# ENDPOINT TESTS
# ==========================================

def test_geocode_endpoint_authenticated(client, auth_headers):
    """
    Test that the geocode endpoint works for authenticated users.
    """
    original_mock = settings.GOOGLE_MAPS_MOCK
    settings.GOOGLE_MAPS_MOCK = True
    
    try:
        response = client.get("/api/v1/geocoding/geocode?address=Pune", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["latitude"] == 18.5204
        assert data["longitude"] == 73.8567
        assert data["success"] is True
    finally:
        settings.GOOGLE_MAPS_MOCK = original_mock

def test_geocode_endpoint_unauthenticated(client):
    """
    Test that unauthenticated requests are rejected.
    """
    response = client.get("/api/v1/geocoding/geocode?address=Pune")
    assert response.status_code == 401

def test_reverse_geocode_endpoint_authenticated(client, auth_headers):
    """
    Test that the reverse geocode endpoint works for authenticated users.
    """
    original_mock = settings.GOOGLE_MAPS_MOCK
    settings.GOOGLE_MAPS_MOCK = True
    
    try:
        response = client.get("/api/v1/geocoding/reverse?latitude=18.52&longitude=73.85", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["city"] == "Pune"
        assert data["success"] is True
    finally:
        settings.GOOGLE_MAPS_MOCK = original_mock

def test_reverse_geocode_endpoint_validation(client, auth_headers):
    """
    Test coordinate range validation on endpoints.
    """
    # Latitude > 90
    response = client.get("/api/v1/geocoding/reverse?latitude=95.0&longitude=73.0", headers=auth_headers)
    assert response.status_code == 422

# ==========================================
# INTEGRATION WITH ADDRESS WORKFLOWS
# ==========================================

def test_address_creation_auto_geocodes(client, auth_headers, db_session):
    """
    Tests that address creation automatically geocodes if coordinates are not provided.
    """
    original_mock = settings.GOOGLE_MAPS_MOCK
    settings.GOOGLE_MAPS_MOCK = True
    
    try:
        payload = {
            "address_type": "Home",
            "street": "MG Road",
            "city": "Delhi",
            "state": "Delhi",
            "pincode": "110001"
            # latitude and longitude are omitted
        }
        response = client.post("/api/v1/addresses/", json=payload, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        
        # Coordinates should have been populated by mock geocoder (Delhi: 28.6139, 77.2090)
        assert data["latitude"] == 28.6139
        assert data["longitude"] == 77.2090
    finally:
        settings.GOOGLE_MAPS_MOCK = original_mock

def test_address_update_auto_geocodes(client, auth_headers, db_session, active_user):
    """
    Tests that updating address fields (like city) automatically recalculates coordinates.
    """
    original_mock = settings.GOOGLE_MAPS_MOCK
    settings.GOOGLE_MAPS_MOCK = True
    
    try:
        # Create an address with Mumbai coordinates
        address = Address(
            user_id=active_user.id,
            street="Marine Drive",
            city="Mumbai",
            state="Maharashtra",
            pincode="400001",
            latitude=19.0760,
            longitude=72.8777
        )
        db_session.add(address)
        db_session.commit()
        db_session.refresh(address)
        
        # Update the address to Pune, omitting coordinates
        payload = {
            "city": "Pune"
        }
        response = client.put(f"/api/v1/addresses/{address.id}", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Coordinates should have updated to Pune (18.5204, 73.8567)
        assert data["latitude"] == 18.5204
        assert data["longitude"] == 73.8567
    finally:
        settings.GOOGLE_MAPS_MOCK = original_mock

# ==========================================
# SIMULATED LIVE CALL TESTS (EXTERNAL API MOCKING)
# ==========================================

@mock.patch("requests.get")
def test_real_geocode_api_success(mock_get):
    """
    Verify geocoding service calls Google Maps API and parses responses correctly.
    """
    original_mock = settings.GOOGLE_MAPS_MOCK
    original_key = settings.GOOGLE_MAPS_API_KEY
    
    # Configure settings to use "real" service path
    settings.GOOGLE_MAPS_MOCK = False
    settings.GOOGLE_MAPS_API_KEY = "test_google_maps_api_key_123"
    
    try:
        mock_response = mock.Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "OK",
            "results": [
                {
                    "geometry": {
                        "location": {
                            "lat": 12.345,
                            "lng": 67.890
                        }
                    },
                    "formatted_address": "Test Street, Test City, 12345"
                }
            ]
        }
        mock_get.return_value = mock_response
        
        res = geocoding_service.geocode_address("Test Address")
        assert res is not None
        assert res["latitude"] == 12.345
        assert res["longitude"] == 67.890
        assert res["formatted_address"] == "Test Street, Test City, 12345"
        
        # Verify correct URL and parameters used
        mock_get.assert_called_once_with(
            "https://maps.googleapis.com/maps/api/geocode/json",
            params={"address": "Test Address", "key": "test_google_maps_api_key_123"},
            timeout=10
        )
    finally:
        settings.GOOGLE_MAPS_MOCK = original_mock
        settings.GOOGLE_MAPS_API_KEY = original_key

@mock.patch("requests.get")
def test_real_reverse_geocode_api_success(mock_get):
    """
    Verify reverse geocoding service parses address components correctly from Google API response.
    """
    original_mock = settings.GOOGLE_MAPS_MOCK
    original_key = settings.GOOGLE_MAPS_API_KEY
    
    settings.GOOGLE_MAPS_MOCK = False
    settings.GOOGLE_MAPS_API_KEY = "test_google_maps_api_key_123"
    
    try:
        mock_response = mock.Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "OK",
            "results": [
                {
                    "formatted_address": "Flat 2, Hill Road, Bandra West, Mumbai, Maharashtra 400050, India",
                    "address_components": [
                        {"long_name": "Hill Road", "types": ["route"]},
                        {"long_name": "Bandra West", "types": ["sublocality_level_1", "sublocality"]},
                        {"long_name": "Mumbai", "types": ["locality"]},
                        {"long_name": "Maharashtra", "types": ["administrative_area_level_1"]},
                        {"long_name": "400050", "types": ["postal_code"]}
                    ]
                }
            ]
        }
        mock_get.return_value = mock_response
        
        res = geocoding_service.reverse_geocode_coordinates(19.05, 72.83)
        assert res is not None
        assert res["street"] == "Hill Road"
        assert res["city"] == "Mumbai"
        assert res["state"] == "Maharashtra"
        assert res["pincode"] == "400050"
    finally:
        settings.GOOGLE_MAPS_MOCK = original_mock
        settings.GOOGLE_MAPS_API_KEY = original_key
