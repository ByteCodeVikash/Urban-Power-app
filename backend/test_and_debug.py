import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.user import User

client = TestClient(app, raise_server_exceptions=True)

# Log in as admin
print("Logging in as admin...")
login_response = client.post("/api/v1/admin/login", json={
    "username_or_email": "admin",
    "password": "adminpassword"
})
admin_token = login_response.json().get("access_token")
admin_headers = {"Authorization": f"Bearer {admin_token}"}

# Get a regular user token
db = SessionLocal()
user = db.query(User).first()
db.close()

if not user:
    print("No user found in DB! Let's check how users are created or if we need to seed one.")
    user_token = None
    user_headers = {}
else:
    print(f"Using user: {user.phone} ({user.id})")
    from app.core.security import create_access_token
    user_token = create_access_token(user_id=str(user.id), phone=user.phone, role="client")
    user_headers = {"Authorization": f"Bearer {user_token}"}

endpoints = [
    ("/api/v1/admin/orders/statistics", admin_headers, "Admin Stats"),
    ("/api/v1/admin/orders/technicians", admin_headers, "Admin Techs"),
    ("/api/v1/admin/orders?page_size=5", admin_headers, "Admin Orders"),
    ("/api/v1/maintenance-bookings/me", user_headers, "User Maintenance Bookings"),
    ("/api/v1/scrap-bookings/me", user_headers, "User Scrap Bookings"),
]

for url, headers, name in endpoints:
    print(f"\n==================================================")
    print(f"Testing {name}: {url}")
    print(f"==================================================")
    try:
        res = client.get(url, headers=headers)
        print(f"STATUS: {res.status_code}")
        print(f"BODY: {res.text}")
    except Exception as e:
        print("EXCEPTION OCCURRED:")
        import traceback
        traceback.print_exc()
