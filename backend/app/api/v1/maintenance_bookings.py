from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.models.user import User
from app.schemas.maintenance_booking import (
    MaintenanceBookingCreate,
    MaintenanceBookingResponse,
    MaintenanceBookingUpdate,
)
from app.services import maintenance_booking as maintenance_booking_service
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/maintenance-bookings", tags=["maintenance-bookings"])


@router.post("/", response_model=MaintenanceBookingResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance_booking(
    booking_in: MaintenanceBookingCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Create a new maintenance service booking for the current user.
    Data is persisted to PostgreSQL under the maintenance_bookings table.
    """
    return maintenance_booking_service.create_maintenance_booking(
        db=db, user_id=current_user.id, booking_in=booking_in
    )


@router.get("/me", response_model=List[MaintenanceBookingResponse])
def list_my_maintenance_bookings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve all maintenance bookings made by the current authenticated user.
    """
    return maintenance_booking_service.get_user_maintenance_bookings(
        db=db, user_id=current_user.id
    )


@router.get("/{booking_id}", response_model=MaintenanceBookingResponse)
def get_maintenance_booking(
    booking_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve details of a specific maintenance booking belonging to the current user.
    """
    db_booking = maintenance_booking_service.get_maintenance_booking(
        db=db, booking_id=booking_id, user_id=current_user.id
    )
    if not db_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance booking not found",
        )
    return db_booking


@router.put("/{booking_id}", response_model=MaintenanceBookingResponse)
def update_maintenance_booking(
    booking_id: UUID,
    booking_in: MaintenanceBookingUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Update a maintenance booking's status or notes.
    """
    db_booking = maintenance_booking_service.update_maintenance_booking(
        db=db, booking_id=booking_id, booking_in=booking_in, user_id=current_user.id
    )
    if not db_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance booking not found",
        )
    return db_booking
