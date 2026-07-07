from datetime import datetime
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.maintenance_booking import MaintenanceBooking, MaintenanceBookingStatus
from app.schemas.maintenance_booking import MaintenanceBookingCreate, MaintenanceBookingUpdate


def create_maintenance_booking(
    db: Session,
    user_id: UUID,
    booking_in: MaintenanceBookingCreate,
) -> MaintenanceBooking:
    """
    Create a new maintenance service booking for a user.
    """
    booking_data = booking_in.model_dump()
    booking_data["user_id"] = user_id
    booking_data.setdefault("status", MaintenanceBookingStatus.PENDING)

    db_booking = MaintenanceBooking(**booking_data)
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


def get_maintenance_booking(
    db: Session,
    booking_id: UUID,
    user_id: Optional[UUID] = None,
) -> Optional[MaintenanceBooking]:
    """
    Retrieve a maintenance booking by ID. Optionally filter by user_id.
    """
    query = db.query(MaintenanceBooking).filter(MaintenanceBooking.id == booking_id)
    if user_id:
        query = query.filter(MaintenanceBooking.user_id == user_id)
    return query.first()


def get_user_maintenance_bookings(db: Session, user_id: UUID) -> List[MaintenanceBooking]:
    """
    List all maintenance bookings for a user, ordered newest first.
    """
    return (
        db.query(MaintenanceBooking)
        .filter(MaintenanceBooking.user_id == user_id)
        .order_by(MaintenanceBooking.booking_date.desc())
        .all()
    )


def update_maintenance_booking(
    db: Session,
    booking_id: UUID,
    booking_in: MaintenanceBookingUpdate,
    user_id: Optional[UUID] = None,
) -> Optional[MaintenanceBooking]:
    """
    Update an existing maintenance booking.
    """
    db_booking = get_maintenance_booking(db, booking_id, user_id)
    if not db_booking:
        return None

    update_data = booking_in.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(db_booking, key, val)

    db.commit()
    db.refresh(db_booking)
    return db_booking
