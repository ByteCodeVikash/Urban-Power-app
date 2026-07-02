import pytest
import sys
import os
import uuid
from datetime import datetime, time, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.core.database import get_db, engine
from app.models.user import User
from app.models.category import Category
from app.models.service import Service
from app.models.address import Address
from app.models.timeslot import Timeslot
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment
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
        email="booking.test.user@example.com",
        full_name="Booking Test User",
        phone="+919999999980",
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
        email="booking.other.user@example.com",
        full_name="Other Booking User",
        phone="+919999999981",
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

@pytest.fixture(scope="function")
def test_service(db_session):
    """
    Fixture to create a category and a service for testing.
    """
    category = Category(
        name="Test Category",
        description="A category for booking testing"
    )
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)

    service = Service(
        category_id=category.id,
        name="Test Plumbing Service",
        description="A plumbing service for booking testing",
        price=150.00,
        active=True
    )
    db_session.add(service)
    db_session.commit()
    db_session.refresh(service)
    return service

@pytest.fixture(scope="function")
def test_address(db_session, active_user):
    """
    Fixture to create a saved address for the active user.
    """
    address = Address(
        user_id=active_user.id,
        address_type="Home",
        street="12 Main Road",
        city="Mumbai",
        state="Maharashtra",
        pincode="400001",
        is_default=True
    )
    db_session.add(address)
    db_session.commit()
    db_session.refresh(address)
    return address


def test_create_and_get_timeslot(client, auth_headers, db_session, test_service):
    """
    Tests creating a timeslot and retrieving it.
    """
    payload = {
        "service_id": str(test_service.id),
        "start_time": "10:00:00",
        "end_time": "12:30:00",
        "active": True
    }

    # Create Timeslot
    response = client.post("/api/v1/bookings/timeslots", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["start_time"] == "10:00:00"
    assert data["end_time"] == "12:30:00"
    assert data["active"] is True
    assert data["service_id"] == str(test_service.id)
    timeslot_id = data["id"]

    # Get service timeslots
    response = client.get(f"/api/v1/bookings/timeslots/service/{test_service.id}", headers=auth_headers)
    assert response.status_code == 200
    timeslots_list = response.json()
    assert len(timeslots_list) == 1
    assert timeslots_list[0]["id"] == timeslot_id

    # Get single timeslot details
    response = client.get(f"/api/v1/bookings/timeslots/{timeslot_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == timeslot_id


def test_create_and_list_bookings(client, auth_headers, db_session, active_user, test_service, test_address):
    """
    Tests creating a booking with timeslot and address, and listing it.
    """
    # Create Timeslot
    timeslot = Timeslot(
        service_id=test_service.id,
        start_time=time(14, 0),
        end_time=time(16, 0),
        active=True
    )
    db_session.add(timeslot)
    db_session.commit()
    db_session.refresh(timeslot)

    booking_date = (datetime.utcnow() + timedelta(days=2)).isoformat() + "Z"

    payload = {
        "service_id": str(test_service.id),
        "address_id": str(test_address.id),
        "booking_date": booking_date,
        "timeslot_id": str(timeslot.id),
        "status": "pending",
        "total_price": 150.00,
        "notes": "Please ring the bell twice."
    }

    # Create Booking
    response = client.post("/api/v1/bookings/", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["notes"] == "Please ring the bell twice."
    assert data["total_price"] == 150.00
    assert data["status"] == "pending"
    assert data["user_id"] == str(active_user.id)
    assert data["timeslot_id"] == str(timeslot.id)
    assert data["address_id"] == str(test_address.id)
    booking_id = data["id"]

    # List Bookings
    response = client.get("/api/v1/bookings/me", headers=auth_headers)
    assert response.status_code == 200
    bookings_list = response.json()
    assert len(bookings_list) == 1
    assert bookings_list[0]["id"] == booking_id



def test_booking_status_workflow(client, auth_headers, db_session, active_user, test_service, test_address):
    """
    Tests that booking transitions through allowed workflow states:
    pending -> confirmed -> assigned -> in_progress -> completed -> cancelled.
    Also verifies invalid states are rejected.
    """
    booking = Booking(
        user_id=active_user.id,
        service_id=test_service.id,
        address_id=test_address.id,
        booking_date=datetime.utcnow() + timedelta(days=1),
        status=BookingStatus.PENDING,
        total_price=150.00,
        notes="Work-flow test"
    )
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)

    # Transition to confirmed
    response = client.put(f"/api/v1/bookings/{booking.id}", json={"status": "confirmed"}, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "confirmed"

    # Transition to assigned
    response = client.put(f"/api/v1/bookings/{booking.id}", json={"status": "assigned"}, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "assigned"

    # Transition to in_progress
    response = client.put(f"/api/v1/bookings/{booking.id}", json={"status": "in_progress"}, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "in_progress"

    # Transition to completed
    response = client.put(f"/api/v1/bookings/{booking.id}", json={"status": "completed"}, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "completed"

    # Transition to cancelled
    response = client.put(f"/api/v1/bookings/{booking.id}", json={"status": "cancelled"}, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"

    # Attempt to use invalid status (should trigger Pydantic validation error / status 422)
    response = client.put(f"/api/v1/bookings/{booking.id}", json={"status": "invalid_status"}, headers=auth_headers)
    assert response.status_code == 422


def test_cannot_access_other_user_booking(client, auth_headers, db_session, other_user, test_service):
    """
    Tests that a user cannot retrieve or modify another user's booking.
    """
    # Create booking for other_user
    booking = Booking(
        user_id=other_user.id,
        service_id=test_service.id,
        booking_date=datetime.utcnow() + timedelta(days=1),
        status=BookingStatus.PENDING,
        total_price=150.00
    )
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)

    # Try to GET details
    response = client.get(f"/api/v1/bookings/{booking.id}", headers=auth_headers)
    assert response.status_code == 404

    # Try to PUT update
    response = client.put(f"/api/v1/bookings/{booking.id}", json={"notes": "Hacked"}, headers=auth_headers)
    assert response.status_code == 404

    # Try to DELETE
    response = client.delete(f"/api/v1/bookings/{booking.id}", headers=auth_headers)
    assert response.status_code == 404


def test_get_available_dates_success(client, db_session, test_service):
    """
    Test retrieving available dates for an active service with active timeslots.
    """
    # Create an active timeslot
    timeslot = Timeslot(
        service_id=test_service.id,
        start_time=time(14, 0),
        end_time=time(16, 0),
        active=True
    )
    db_session.add(timeslot)
    db_session.commit()

    response = client.get(f"/api/v1/bookings/available-dates?service_id={test_service.id}")
    assert response.status_code == 200
    data = response.json()
    assert "available_dates" in data
    assert len(data["available_dates"]) > 0

    # Verify formatting (YYYY-MM-DD)
    date_str = data["available_dates"][0]
    parsed_date = datetime.strptime(date_str, "%Y-%m-%d")
    assert parsed_date is not None


def test_get_available_dates_service_not_found(client):
    """
    Test retrieving available dates for a non-existent service ID.
    """
    random_uuid = str(uuid.uuid4())
    response = client.get(f"/api/v1/bookings/available-dates?service_id={random_uuid}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Service not found"


def test_get_available_dates_service_inactive(client, db_session, test_service):
    """
    Test retrieving available dates for an inactive service.
    """
    test_service.active = False
    db_session.commit()

    response = client.get(f"/api/v1/bookings/available-dates?service_id={test_service.id}")
    assert response.status_code == 400
    assert response.json()["detail"] == "Service is inactive"


def test_get_available_dates_excludes_fully_booked(client, db_session, test_service, active_user):
    """
    Test that a date is not available if all timeslots are booked.
    """
    # Create one timeslot
    timeslot = Timeslot(
        service_id=test_service.id,
        start_time=time(14, 0),
        end_time=time(16, 0),
        active=True
    )
    db_session.add(timeslot)
    db_session.commit()

    # Get available dates initially
    response = client.get(f"/api/v1/bookings/available-dates?service_id={test_service.id}")
    initial_dates = response.json()["available_dates"]
    assert len(initial_dates) > 0
    target_date_str = initial_dates[0]
    target_date = datetime.strptime(target_date_str, "%Y-%m-%d")

    # Create a booking on that date and timeslot
    booking = Booking(
        user_id=active_user.id,
        service_id=test_service.id,
        booking_date=target_date,
        timeslot_id=timeslot.id,
        status=BookingStatus.PENDING,
        total_price=150.00
    )
    db_session.add(booking)
    db_session.commit()

    # Fetch available dates again and verify target_date_str is no longer in the list
    response = client.get(f"/api/v1/bookings/available-dates?service_id={test_service.id}")
    new_dates = response.json()["available_dates"]
    assert target_date_str not in new_dates


def test_get_available_dates_excludes_past_timeslots_today(client, db_session, test_service):
    """
    Test that today is not returned if the only timeslot is in the past.
    """
    current_utc = datetime.utcnow()
    # Check if current time is not exactly midnight. If it is, set it to 1 second before current time
    past_time = time(0, 0, 0)
    if current_utc.hour == 0 and current_utc.minute == 0:
        past_time = time(23, 59, 59)
    
    timeslot = Timeslot(
        service_id=test_service.id,
        start_time=past_time,
        end_time=time(23, 59, 59),
        active=True
    )
    db_session.add(timeslot)
    db_session.commit()

    response = client.get(f"/api/v1/bookings/available-dates?service_id={test_service.id}")
    dates = response.json()["available_dates"]
    
    today_str = current_utc.strftime("%Y-%m-%d")
    assert today_str not in dates


def test_get_available_timeslots_success(client, db_session, test_service, active_user):
    """
    Test retrieving available timeslots for a service on a given date.
    """
    # Create active timeslot
    timeslot1 = Timeslot(
        service_id=test_service.id,
        start_time=time(9, 0),
        end_time=time(10, 0),
        active=True
    )
    timeslot2 = Timeslot(
        service_id=test_service.id,
        start_time=time(10, 0),
        end_time=time(11, 0),
        active=True
    )
    db_session.add_all([timeslot1, timeslot2])
    db_session.commit()

    future_date = (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d")

    # Fetch available timeslots
    response = client.get(f"/api/v1/bookings/available-timeslots?service_id={test_service.id}&date={future_date}")
    assert response.status_code == 200
    data = response.json()
    assert "available_timeslots" in data
    slots = data["available_timeslots"]
    assert len(slots) == 2
    assert slots[0]["available"] is True
    assert slots[1]["available"] is True

    # Book timeslot1 on that date
    booking = Booking(
        user_id=active_user.id,
        service_id=test_service.id,
        booking_date=datetime.strptime(future_date, "%Y-%m-%d").date(),
        timeslot_id=timeslot1.id,
        status=BookingStatus.PENDING,
        total_price=150.00
    )
    db_session.add(booking)
    db_session.commit()

    # Fetch again, timeslot1 should be unavailable, timeslot2 should be available
    response = client.get(f"/api/v1/bookings/available-timeslots?service_id={test_service.id}&date={future_date}")
    assert response.status_code == 200
    slots = response.json()["available_timeslots"]
    assert len(slots) == 2
    
    # Sort slots by start_time to check
    slots = sorted(slots, key=lambda x: x["start_time"])
    assert slots[0]["id"] == str(timeslot1.id)
    assert slots[0]["available"] is False
    assert slots[1]["id"] == str(timeslot2.id)
    assert slots[1]["available"] is True


def test_create_booking_new_features(client, auth_headers, db_session, active_user, test_service, test_address):
    """
    Tests the new booking creation endpoint features:
    - Custom fields: booking_id, booking_status, booking_reference, photos, payment_method.
    - Robust validations: Service exists, Address exists, Timeslot exists, Timeslot available, Date valid.
    """
    # Create active timeslot
    timeslot = Timeslot(
        service_id=test_service.id,
        start_time=time(14, 0),
        end_time=time(16, 0),
        active=True
    )
    db_session.add(timeslot)
    db_session.commit()
    db_session.refresh(timeslot)

    booking_date = (datetime.utcnow() + timedelta(days=2)).isoformat() + "Z"

    # Test Case 1: Valid booking creation with photos and payment method
    payload = {
        "service_id": str(test_service.id),
        "address_id": str(test_address.id),
        "booking_date": booking_date,
        "timeslot_id": str(timeslot.id),
        "notes": "Test photos and payment method",
        "photos": ["http://example.com/photo1.jpg", "http://example.com/photo2.jpg"],
        "payment_method": "credit_card"
    }

    response = client.post("/api/v1/bookings/", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert "booking_id" in data
    assert "booking_status" in data
    assert "booking_reference" in data
    assert data["photos"] == ["http://example.com/photo1.jpg", "http://example.com/photo2.jpg"]
    assert data["payment_method"] == "credit_card"
    assert data["booking_status"] == "pending"
    assert data["booking_reference"].startswith("UP-")

    # Test Case 2: Validation - Service does not exist
    invalid_service_payload = payload.copy()
    invalid_service_payload["service_id"] = str(uuid.uuid4())
    response = client.post("/api/v1/bookings/", json=invalid_service_payload, headers=auth_headers)
    assert response.status_code == 404
    assert "Service not found" in response.json()["detail"]

    # Test Case 3: Validation - Address does not exist / does not belong to user
    invalid_address_payload = payload.copy()
    invalid_address_payload["address_id"] = str(uuid.uuid4())
    response = client.post("/api/v1/bookings/", json=invalid_address_payload, headers=auth_headers)
    assert response.status_code == 404
    assert "Address not found" in response.json()["detail"]

    # Test Case 4: Validation - Timeslot does not exist / does not belong to service
    invalid_timeslot_payload = payload.copy()
    invalid_timeslot_payload["timeslot_id"] = str(uuid.uuid4())
    response = client.post("/api/v1/bookings/", json=invalid_timeslot_payload, headers=auth_headers)
    assert response.status_code == 404
    assert "Timeslot not found" in response.json()["detail"]

    # Test Case 5: Validation - Date in the past
    past_date = (datetime.utcnow() - timedelta(days=1)).isoformat() + "Z"
    past_date_payload = payload.copy()
    past_date_payload["booking_date"] = past_date
    response = client.post("/api/v1/bookings/", json=past_date_payload, headers=auth_headers)
    assert response.status_code == 400
    assert "Booking date cannot be in the past" in response.json()["detail"]

    # Test Case 6: Validation - Timeslot already booked (unavailable)
    # Since we booked it once, trying to book the exact same slot/date/service should fail
    response = client.post("/api/v1/bookings/", json=payload, headers=auth_headers)
    assert response.status_code == 400
    assert "Timeslot is already booked for this date" in response.json()["detail"]


def test_get_booking_history(client, auth_headers, db_session, active_user, test_service, test_address):
    """
    Tests retrieving the booking history list.
    """
    # Create active timeslot
    timeslot = Timeslot(
        service_id=test_service.id,
        start_time=time(14, 0),
        end_time=time(16, 0),
        active=True
    )
    db_session.add(timeslot)
    db_session.commit()
    db_session.refresh(timeslot)

    # Create a booking
    booking = Booking(
        user_id=active_user.id,
        service_id=test_service.id,
        address_id=test_address.id,
        booking_date=datetime.utcnow() + timedelta(days=2),
        timeslot_id=timeslot.id,
        status=BookingStatus.PENDING,
        total_price=150.00,
        notes="Test history"
    )
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)

    # Create payment details linked to booking
    payment = Payment(
        booking_id=booking.id,
        user_id=active_user.id,
        payment_method="COD",
        payment_status="pending",
        amount=150.00
    )
    db_session.add(payment)
    db_session.commit()
    db_session.refresh(booking)

    # Call history endpoint
    response = client.get("/api/v1/bookings/history", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    item = data[0]
    assert item["booking_id"] == str(booking.id)
    assert item["service"] == test_service.name
    assert item["date"] == booking.booking_date.strftime("%Y-%m-%d")
    assert item["timeslot"] == "14:00:00 - 16:00:00"
    assert item["status"] == "pending"
    assert item["payment_method"] == "COD"




