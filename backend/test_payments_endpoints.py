"""
Backend integration tests for the Razorpay payments API endpoints.
Run with:  ./venv/bin/pytest test_payments_endpoints.py -v
"""
import uuid
import sys
import os
from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.core.database import get_db, engine
from app.models.user import User
from app.models.category import Category
from app.models.service import Service
from app.models.address import Address
from app.models.booking import Booking, BookingStatus
from app.core.security import create_access_token

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="function")
def db_session():
    """Run each test inside a rolled-back transaction."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.pop(get_db, None)


@pytest.fixture(scope="function")
def active_user(db_session):
    user = User(
        email="payment.test@example.com",
        full_name="Payment Tester",
        phone="+919876500001",
        role="client",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def auth_headers(active_user):
    token = create_access_token(
        user_id=str(active_user.id),
        phone=active_user.phone,
        role=active_user.role,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def test_service(db_session):
    cat = Category(name="Payment Test Cat", description="test")
    db_session.add(cat)
    db_session.commit()
    db_session.refresh(cat)

    svc = Service(
        category_id=cat.id,
        name="Test AC Service",
        description="For payment tests",
        price=499.00,
        active=True,
    )
    db_session.add(svc)
    db_session.commit()
    db_session.refresh(svc)
    return svc


@pytest.fixture(scope="function")
def test_address(db_session, active_user):
    addr = Address(
        user_id=active_user.id,
        address_type="Home",
        street="123 Main St",
        city="Delhi",
        state="Delhi",
        pincode="110001",
        is_default=True,
    )
    db_session.add(addr)
    db_session.commit()
    db_session.refresh(addr)
    return addr


@pytest.fixture(scope="function")
def test_booking(db_session, active_user, test_service, test_address):
    booking = Booking(
        user_id=active_user.id,
        service_id=test_service.id,
        address_id=test_address.id,
        booking_date=datetime.utcnow() + timedelta(days=2),
        status=BookingStatus.PENDING,
        total_price=499.00,
        notes="Payment test booking",
    )
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)
    return booking


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_create_payment_order_success(client, auth_headers, test_booking):
    """Happy-path: create a payment order for a valid pending booking."""
    payload = {"booking_id": str(test_booking.id), "amount": 499.00}
    resp = client.post("/api/v1/payments/create-order", json=payload, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert "order_id" in data
    assert data["order_id"].startswith("order_mock_")
    assert data["currency"] == "INR"
    assert data["amount"] == 499.00


def test_create_payment_order_invalid_amount(client, auth_headers, test_booking):
    """Amount mismatch should return 400."""
    payload = {"booking_id": str(test_booking.id), "amount": 100.00}
    resp = client.post("/api/v1/payments/create-order", json=payload, headers=auth_headers)
    assert resp.status_code == 400
    assert "Amount does not match" in resp.json()["detail"]


def test_create_payment_order_booking_not_found(client, auth_headers):
    """Unknown booking ID should return 404."""
    payload = {"booking_id": str(uuid.uuid4()), "amount": 499.00}
    resp = client.post("/api/v1/payments/create-order", json=payload, headers=auth_headers)
    assert resp.status_code == 404
    assert "Booking not found" in resp.json()["detail"]


def test_create_payment_order_cancelled_booking(client, auth_headers, db_session, test_booking):
    """Creating an order for a cancelled booking should return 400."""
    test_booking.status = BookingStatus.CANCELLED
    db_session.commit()

    payload = {"booking_id": str(test_booking.id), "amount": 499.00}
    resp = client.post("/api/v1/payments/create-order", json=payload, headers=auth_headers)
    assert resp.status_code == 400
    assert "cancelled" in resp.json()["detail"].lower()


def test_verify_payment_success(client, auth_headers, db_session, test_booking):
    """Full happy-path: create order → verify → booking becomes confirmed."""
    # Step 1 – create order
    order_resp = client.post(
        "/api/v1/payments/create-order",
        json={"booking_id": str(test_booking.id), "amount": 499.00},
        headers=auth_headers,
    )
    assert order_resp.status_code == 201
    order_id = order_resp.json()["order_id"]

    # Step 2 – verify payment
    verify_resp = client.post(
        "/api/v1/payments/verify",
        json={
            "razorpay_payment_id": "pay_mock_abc123",
            "razorpay_order_id": order_id,
            "razorpay_signature": "mock_signature",
        },
        headers=auth_headers,
    )
    assert verify_resp.status_code == 200
    data = verify_resp.json()
    assert data["payment_status"] == "completed"
    assert data["transaction_id"] == "pay_mock_abc123"

    # Step 3 – booking should now be confirmed
    db_session.refresh(test_booking)
    assert test_booking.status == BookingStatus.CONFIRMED


def test_verify_payment_not_found(client, auth_headers):
    """Verifying a payment for an unknown order_id should return 404."""
    verify_resp = client.post(
        "/api/v1/payments/verify",
        json={
            "razorpay_payment_id": "pay_mock_xyz",
            "razorpay_order_id": "order_mock_does_not_exist",
            "razorpay_signature": "mock_sig",
        },
        headers=auth_headers,
    )
    assert verify_resp.status_code == 404
    assert "not found" in verify_resp.json()["detail"].lower()
