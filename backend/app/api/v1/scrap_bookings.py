from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.models.user import User
from app.schemas.scrap_booking import ScrapBookingCreate, ScrapBookingResponse, ScrapBookingUpdate
from app.services import scrap_booking as scrap_booking_service
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/scrap-bookings", tags=["scrap-bookings"])


@router.post("/", response_model=ScrapBookingResponse, status_code=status.HTTP_201_CREATED)
def create_scrap_booking(
    booking_in: ScrapBookingCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Create a new scrap (Kabadi) pickup booking for the current user.
    Data is persisted to PostgreSQL under the scrap_bookings table.
    """
    return scrap_booking_service.create_scrap_booking(
        db=db, user_id=current_user.id, booking_in=booking_in
    )


@router.get("/me", response_model=List[ScrapBookingResponse])
def list_my_scrap_bookings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve all scrap pickup bookings made by the current authenticated user.
    """
    return scrap_booking_service.get_user_scrap_bookings(db=db, user_id=current_user.id)


@router.get("/{booking_id}", response_model=ScrapBookingResponse)
def get_scrap_booking(
    booking_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve details of a specific scrap booking belonging to the current user.
    """
    db_booking = scrap_booking_service.get_scrap_booking(
        db=db, booking_id=booking_id, user_id=current_user.id
    )
    if not db_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scrap booking not found",
        )
    return db_booking


@router.put("/{booking_id}", response_model=ScrapBookingResponse)
def update_scrap_booking(
    booking_id: UUID,
    booking_in: ScrapBookingUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Update a scrap booking's status or notes.
    """
    db_booking = scrap_booking_service.update_scrap_booking(
        db=db, booking_id=booking_id, booking_in=booking_in, user_id=current_user.id
    )
    if not db_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scrap booking not found",
        )
    return db_booking
