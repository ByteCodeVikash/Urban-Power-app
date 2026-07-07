import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.category import Category
from app.models.service import Service
from app.models.timeslot import Timeslot
from app.models.address import Address
from app.models.scrap import ScrapCategory, ScrapItem
from app.models.maintenance import MaintenanceCategory, MaintenanceService

db = SessionLocal()

print("=== USERS ===")
users = db.query(User).all()
for u in users:
    print(f"ID: {u.id} | Email: {u.email} | Name: {u.full_name} | Phone: {u.phone} | Role: {u.role}")

print("\n=== ADDRESSES ===")
addrs = db.query(Address).all()
for a in addrs:
    print(f"ID: {a.id} | UserID: {a.user_id} | Street: {a.street} | City: {a.city} | Default: {a.is_default}")

print("\n=== CATEGORIES & SERVICES (GENERAL) ===")
cats = db.query(Category).all()
for c in cats:
    print(f"Category: {c.name} (ID: {c.id})")
    for s in c.services:
        print(f"  Service: {s.name} (ID: {s.id}) Price: {s.price}")
        for t in s.timeslots:
            print(f"    Timeslot: {t.id} | {t.start_time} - {t.end_time} | Active: {t.active}")

print("\n=== SCRAP CATEGORIES & ITEMS ===")
scats = db.query(ScrapCategory).all()
for sc in scats:
    print(f"Scrap Category: {sc.name} (ID: {sc.id})")
    for si in sc.items:
        print(f"  Item: {si.name} (ID: {si.id}) Price: {si.price_per_kg}")

print("\n=== MAINTENANCE CATEGORIES & SERVICES ===")
mcats = db.query(MaintenanceCategory).all()
for mc in mcats:
    print(f"Maintenance Category: {mc.name} (ID: {mc.id})")
    for ms in mc.services:
        print(f"  Service: {ms.name} (ID: {ms.id}) Price: {ms.price}")

db.close()
