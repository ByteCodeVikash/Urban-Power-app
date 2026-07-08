# verify_e2e.py
import sys
import os
import uuid
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

# Path setup
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.core.database import SessionLocal
from app.models.user import User
from app.models.address import Address
from app.models.service import Service
from app.models.timeslot import Timeslot
from app.models.booking import Booking, BookingStatus
from app.models.booking_status_history import BookingStatusHistory
from app.models.admin import Admin
from app.core.security import create_access_token

SEED_PHONE = "+919999911116"
SEED_USER_ID = "10ebbbed-2bf1-4aad-9d5f-29094e7418eb"
SEED_ADDR_ID = "2bf650e2-f170-4e02-9fe2-8b65952f8485"
BEAUTICIAN_SERVICE_ID = "9cab64ce-8ad5-4c73-ad40-74bb6210ce09"
BEAUTICIAN_TIMESLOT_ID = "7e6967c0-4f92-4272-b0da-231264e26ec1"

def check(condition, msg):
    if not condition:
        print(f"❌ FAIL: {msg}")
        sys.exit(1)
    # Print progress to console
    print(f"  [OK] {msg}")

def run_e2e_verification():
    db = SessionLocal()
    client = TestClient(app)

    print("--- PRE-FLIGHT CHECKS ---")
    user = db.query(User).filter(User.phone == SEED_PHONE).first()
    check(user is not None, "Seed user exists in PostgreSQL")
    
    addr = db.query(Address).filter(Address.id == SEED_ADDR_ID).first()
    check(addr is not None, "Seed address exists in PostgreSQL")

    svc = db.query(Service).filter(Service.id == BEAUTICIAN_SERVICE_ID).first()
    check(svc is not None, "Beautician service exists in PostgreSQL")

    # Generate or get temporary admin
    admin_user = db.query(Admin).filter(Admin.email == "verifye2eadmin@urbanpower.com").first()
    if not admin_user:
        admin_user = Admin(
            username="verifye2eadmin",
            email="verifye2eadmin@urbanpower.com",
            password_hash="fake-hash-e2e",
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

    # Generate customer token
    cust_token = create_access_token(user_id=SEED_USER_ID, phone=SEED_PHONE, role="client")
    cust_headers = {"Authorization": f"Bearer {cust_token}"}

    # Generate admin token using actual admin id
    admin_token = create_access_token(user_id=str(admin_user.id), phone="", role="admin")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    print("\n--- STEP 1: Customer creates booking ---")
    from sqlalchemy import func
    booking_date_obj = datetime.utcnow() + timedelta(days=3)
    booking_date = booking_date_obj.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    # Clear any conflicting bookings for the target date and slot
    conflicts = db.query(Booking).filter(
        func.date(Booking.booking_date) == booking_date_obj.date(),
        Booking.timeslot_id == BEAUTICIAN_TIMESLOT_ID
    ).all()
    for conf in conflicts:
        db.query(BookingStatusHistory).filter(BookingStatusHistory.booking_id == str(conf.id)).delete(synchronize_session=False)
        db.delete(conf)
    db.commit()

    payload = {
        "service_id": BEAUTICIAN_SERVICE_ID,
        "address_id": SEED_ADDR_ID,
        "booking_date": booking_date,
        "timeslot_id": BEAUTICIAN_TIMESLOT_ID,
        "notes": "E2E Verification Booking",
        "payment_method": "COD"
    }
    resp = client.post("/api/v1/bookings/", json=payload, headers=cust_headers)
    check(resp.status_code == 201, f"POST /bookings/ returns 201 Created (HTTP {resp.status_code})")
    booking_id = resp.json()["id"]

    print("\n--- STEP 2: Booking stored in PostgreSQL ---")
    db_booking = db.query(Booking).filter(Booking.id == booking_id).first()
    check(db_booking is not None, "Booking record found in PostgreSQL database")
    check(db_booking.status == BookingStatus.PENDING, "PostgreSQL booking status initialized to PENDING")

    print("\n--- STEP 3: Booking appears in Admin Orders ---")
    admin_orders_resp = client.get("/api/v1/admin/orders/", headers=admin_headers)
    check(admin_orders_resp.status_code == 200, f"GET /admin/orders/ returns 200 (HTTP {admin_orders_resp.status_code})")
    orders = admin_orders_resp.json().get("items", [])
    found = any(o["booking_id"] == str(booking_id) for o in orders)
    check(found, f"Created booking ID {booking_id} is visible in Admin Orders list")

    print("\n--- STEP 4: Admin opens booking ---")
    admin_detail_resp = client.get(f"/api/v1/admin/orders/beautician/{booking_id}", headers=admin_headers)
    check(admin_detail_resp.status_code == 200, f"GET /admin/orders/beautician/{booking_id} returns 200 (HTTP {admin_detail_resp.status_code})")
    check(admin_detail_resp.json()["booking_id"] == str(booking_id), "Admin details response contains matching booking ID")

    print("\n--- STEP 5: Admin changes status & Customer refreshes ---")
    # Verify every status: Pending, Accepted, Assigned, Technician On The Way, Work Started, Completed
    statuses = [
        "pending",
        "accepted",
        "assigned",
        "technician_on_the_way",
        "work_started",
        "completed"
    ]

    for status_val in statuses:
        print(f"\n* Testing status: {status_val.upper()} *")
        
        # Admin updates status
        update_payload = {"status": status_val, "notes": f"Updating to {status_val}"}
        update_resp = client.patch(f"/api/v1/admin/orders/beautician/{booking_id}", json=update_payload, headers=admin_headers)
        check(update_resp.status_code == 200, f"PATCH /admin/orders/beautician/{booking_id} to {status_val} returns 200")
        
        # Verify status stored in PostgreSQL (BookingStatusHistory)
        db_history = db.query(BookingStatusHistory).filter(
            BookingStatusHistory.booking_id == str(booking_id),
            BookingStatusHistory.status == status_val
        ).first()
        check(db_history is not None, f"PostgreSQL history table has record for status={status_val}")

        # Customer refreshes booking
        cust_refresh_resp = client.get(f"/api/v1/bookings/{booking_id}", headers=cust_headers)
        check(cust_refresh_resp.status_code == 200, "Customer GET /bookings/{id} returns 200")
        latest_cust_status = cust_refresh_resp.json()["status"]
        check(latest_cust_status == status_val, f"Customer refreshed booking status matches updated value (Expected: {status_val}, Found: {latest_cust_status})")
        
        # Check booking_status as well
        latest_cust_booking_status = cust_refresh_resp.json()["booking_status"]
        check(latest_cust_booking_status == status_val, f"Customer refreshed booking_status field matches updated value (Expected: {status_val}, Found: {latest_cust_booking_status})")

    # Cleanup
    print("\n--- CLEANUP ---")
    db.delete(db_booking)
    db.query(BookingStatusHistory).filter(BookingStatusHistory.booking_id == str(booking_id)).delete(synchronize_session=False)
    db.delete(admin_user)
    db.commit()
    db.close()
    print("  [OK] Cleaned up created booking, status history records, and admin user from PostgreSQL.")

    print("\n==================================================")
    print("✔ End-to-end passed")
    print("✔ APIs tested")
    print("✔ Database verified")
    print("✔ Customer verified")
    print("✔ Admin verified")
    print("==================================================")

if __name__ == "__main__":
    run_e2e_verification()
