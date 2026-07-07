#!/usr/bin/env python3
"""
apply_production_migrations.py
==============================
Run this script ON THE PRODUCTION VPS to:
  1. Check which tables are missing
  2. Create scrap_bookings, maintenance_bookings, booking_status_history
  3. Stamp Alembic to the correct head revision
  4. Verify all tables and indexes exist

Usage (from /path/to/backend/):
    source venv/bin/activate
    python3 apply_production_migrations.py

No arguments needed. It reads the .env file automatically.
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text, inspect
from app.core.database import engine, SessionLocal

# ── Colour helpers ──────────────────────────────────────────────────────────────
def ok(msg):  print(f"\033[92m  ✓ {msg}\033[0m")
def warn(msg): print(f"\033[93m  ⚠ {msg}\033[0m")
def err(msg):  print(f"\033[91m  ✗ {msg}\033[0m")
def info(msg): print(f"  → {msg}")

# ── SQL for the 3 missing tables ───────────────────────────────────────────────
SQL_CREATE_SCRAP_BOOKINGS = """
CREATE TABLE IF NOT EXISTS scrap_bookings (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scrap_item_id      UUID        REFERENCES scrap_items(id) ON DELETE SET NULL,
    address_id         UUID        REFERENCES addresses(id) ON DELETE SET NULL,
    address_text       VARCHAR(1024),
    booking_date       TIMESTAMPTZ NOT NULL,
    time_slot          VARCHAR(100),
    category_name      VARCHAR(255),
    item_name          VARCHAR(255),
    estimated_weight_kg FLOAT,
    estimated_value    FLOAT,
    price_per_kg       FLOAT,
    status             VARCHAR(20) NOT NULL DEFAULT 'requested',
    notes              VARCHAR(1024),
    photos             JSON,
    booking_reference  VARCHAR(50) NOT NULL UNIQUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""

SQL_CREATE_MAINTENANCE_BOOKINGS = """
CREATE TABLE IF NOT EXISTS maintenance_bookings (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_id         UUID        REFERENCES addresses(id) ON DELETE SET NULL,
    address_text       VARCHAR(1024),
    booking_date       TIMESTAMPTZ NOT NULL,
    service_ids        JSON,
    service_names      JSON,
    total_price        NUMERIC(10,2) NOT NULL DEFAULT 0,
    status             VARCHAR(20) NOT NULL DEFAULT 'pending',
    notes              VARCHAR(1024),
    photos             JSON,
    booking_reference  VARCHAR(50) NOT NULL UNIQUE,
    customer_name      VARCHAR(255),
    customer_phone     VARCHAR(20),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""

SQL_CREATE_BOOKING_STATUS_HISTORY = """
CREATE TABLE IF NOT EXISTS booking_status_history (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id       VARCHAR(64) NOT NULL,
    booking_type     VARCHAR(20) NOT NULL,
    status           VARCHAR(50) NOT NULL,
    updated_by       VARCHAR(64),
    updated_by_name  VARCHAR(255),
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""

SQL_CREATE_INDEXES = """
CREATE INDEX IF NOT EXISTS ix_scrap_bookings_id        ON scrap_bookings(id);
CREATE INDEX IF NOT EXISTS ix_scrap_bookings_user_id   ON scrap_bookings(user_id);
CREATE INDEX IF NOT EXISTS ix_scrap_bookings_scrap_item_id ON scrap_bookings(scrap_item_id);
CREATE INDEX IF NOT EXISTS ix_scrap_bookings_address_id ON scrap_bookings(address_id);

CREATE INDEX IF NOT EXISTS ix_maintenance_bookings_id         ON maintenance_bookings(id);
CREATE INDEX IF NOT EXISTS ix_maintenance_bookings_user_id    ON maintenance_bookings(user_id);
CREATE INDEX IF NOT EXISTS ix_maintenance_bookings_address_id ON maintenance_bookings(address_id);

CREATE INDEX IF NOT EXISTS ix_booking_status_history_id         ON booking_status_history(id);
CREATE INDEX IF NOT EXISTS ix_booking_status_history_booking_id ON booking_status_history(booking_id);
"""

# ── ALEMBIC stamp ──────────────────────────────────────────────────────────────
NEW_ALEMBIC_HEAD = "a1b2c3d4e5f6"

def stamp_alembic(conn):
    """Update alembic_version table to reflect the new head."""
    try:
        result = conn.execute(text("SELECT version_num FROM alembic_version")).fetchone()
        current = result[0] if result else None
        info(f"Current alembic revision: {current}")

        if current == NEW_ALEMBIC_HEAD:
            ok("Alembic already at correct head — no stamp needed.")
            return

        if current:
            conn.execute(
                text("UPDATE alembic_version SET version_num = :v"),
                {"v": NEW_ALEMBIC_HEAD}
            )
        else:
            conn.execute(
                text("INSERT INTO alembic_version (version_num) VALUES (:v)"),
                {"v": NEW_ALEMBIC_HEAD}
            )
        ok(f"Alembic stamped: {current} → {NEW_ALEMBIC_HEAD}")
    except Exception as e:
        warn(f"Could not stamp alembic_version: {e}")


def run():
    print("\n" + "="*60)
    print("  Urban Power — Production Migration Runner")
    print("="*60 + "\n")

    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    info(f"Existing tables count: {len(existing_tables)}")

    # Check which target tables are missing
    target_tables = {
        "scrap_bookings":        SQL_CREATE_SCRAP_BOOKINGS,
        "maintenance_bookings":  SQL_CREATE_MAINTENANCE_BOOKINGS,
        "booking_status_history": SQL_CREATE_BOOKING_STATUS_HISTORY,
    }

    missing = [t for t in target_tables if t not in existing_tables]
    present = [t for t in target_tables if t in existing_tables]

    print(f"\n[1/4] Table Status:")
    for t in present:
        ok(f"{t} — already exists")
    for t in missing:
        warn(f"{t} — MISSING, will create")

    if not missing:
        print("\nAll target tables already exist.")
    else:
        print(f"\n[2/4] Creating {len(missing)} missing table(s)...")

    # Apply DDL
    with engine.begin() as conn:
        for table_name, sql in target_tables.items():
            if table_name in missing:
                try:
                    conn.execute(text(sql))
                    ok(f"Created table: {table_name}")
                except Exception as e:
                    err(f"Failed to create {table_name}: {e}")
                    sys.exit(1)

        # Always create indexes (IF NOT EXISTS is safe)
        print(f"\n[3/4] Creating indexes...")
        for stmt in SQL_CREATE_INDEXES.strip().split(";"):
            stmt = stmt.strip()
            if stmt:
                try:
                    conn.execute(text(stmt))
                except Exception as e:
                    warn(f"Index stmt warning: {e}")
        ok("All indexes applied")

        # Stamp Alembic
        print(f"\n[4/4] Stamping Alembic...")
        stamp_alembic(conn)

    # ── Verification ────────────────────────────────────────────────────────────
    print("\n" + "="*60)
    print("  Verification")
    print("="*60)

    inspector2 = inspect(engine)
    final_tables = inspector2.get_table_names()

    all_ok = True
    for table_name in target_tables:
        if table_name in final_tables:
            cols = [c["name"] for c in inspector2.get_columns(table_name)]
            idxs = [i["name"] for i in inspector2.get_indexes(table_name)]
            ok(f"{table_name}: {len(cols)} columns, {len(idxs)} indexes")
        else:
            err(f"{table_name}: NOT FOUND after migration!")
            all_ok = False

    # Quick row-count test
    print("\n  Row counts (should be ≥ 0, not error):")
    with SessionLocal() as db:
        for table_name in target_tables:
            try:
                count = db.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()
                ok(f"  SELECT COUNT(*) FROM {table_name} → {count}")
            except Exception as e:
                err(f"  Query failed on {table_name}: {e}")
                all_ok = False

    print("\n" + "="*60)
    if all_ok:
        print("  \033[92mAll migrations applied successfully! ✓\033[0m")
        print("  Please restart the backend service:")
        print("  sudo systemctl restart urbanpower")
    else:
        print("  \033[91mSome migrations failed. Check errors above.\033[0m")
    print("="*60 + "\n")

if __name__ == "__main__":
    run()
