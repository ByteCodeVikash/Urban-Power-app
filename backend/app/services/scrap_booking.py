from datetime import datetime
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.scrap_booking import ScrapBooking, ScrapBookingStatus
from app.schemas.scrap_booking import ScrapBookingCreate, ScrapBookingUpdate


def create_scrap_booking(
    db: Session,
    user_id: UUID,
    booking_in: ScrapBookingCreate,
) -> ScrapBooking:
    """
    Create a new scrap pickup booking for a user.
    """
    booking_data = booking_in.model_dump()
    booking_data["user_id"] = user_id
    booking_data.setdefault("status", ScrapBookingStatus.REQUESTED)

    db_booking = ScrapBooking(**booking_data)
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


def get_scrap_booking(
    db: Session,
    booking_id: UUID,
    user_id: Optional[UUID] = None,
) -> Optional[ScrapBooking]:
    """
    Retrieve a scrap booking by ID. Optionally filter by user_id.
    """
    query = db.query(ScrapBooking).filter(ScrapBooking.id == booking_id)
    if user_id:
        query = query.filter(ScrapBooking.user_id == user_id)
    return query.first()


def get_user_scrap_bookings(db: Session, user_id: UUID) -> List[ScrapBooking]:
    """
    List all scrap bookings for a user, ordered newest first.
    """
    return (
        db.query(ScrapBooking)
        .filter(ScrapBooking.user_id == user_id)
        .order_by(ScrapBooking.booking_date.desc())
        .all()
    )


def update_scrap_booking(
    db: Session,
    booking_id: UUID,
    booking_in: ScrapBookingUpdate,
    user_id: Optional[UUID] = None,
) -> Optional[ScrapBooking]:
    """
    Update an existing scrap booking.
    """
    db_booking = get_scrap_booking(db, booking_id, user_id)
    if not db_booking:
        return None

    update_data = booking_in.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(db_booking, key, val)

    db.commit()
    db.refresh(db_booking)
    return db_booking
