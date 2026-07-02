from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse, BookingUpdate, AvailableDatesResponse, BookingHistoryItem
from app.schemas.timeslot import TimeslotCreate, TimeslotResponse, TimeslotUpdate, AvailableTimeslotsResponse
from app.services import booking as booking_service
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/bookings", tags=["bookings"])

# Status Endpoint
@router.get("/")
async def get_bookings_status():
    """
    Get functional status of the Bookings API endpoint.
    """
    return {
        "status": "active",
        "message": "Bookings API v1 endpoint is functional."
    }

# Available Dates Endpoint
@router.get("/available-dates", response_model=AvailableDatesResponse)
def get_available_booking_dates(
    service_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Retrieve available booking dates for a specific service.
    
    Validates that the service exists and is active.
    Returns a list of available dates in YYYY-MM-DD format for the next 14 days.
    """
    dates = booking_service.get_available_dates(db=db, service_id=service_id)
    return AvailableDatesResponse(available_dates=dates)

# Available Timeslots Endpoint
@router.get("/available-timeslots", response_model=AvailableTimeslotsResponse)
def get_available_booking_timeslots(
    service_id: UUID,
    date: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve available booking timeslots for a specific service on a specific date.
    
    Validates that the service exists and is active, and date format is YYYY-MM-DD.
    Returns a list of timeslots with availability status.
    """
    slots = booking_service.get_available_timeslots(db=db, service_id=service_id, date_str=date)
    return AvailableTimeslotsResponse(available_timeslots=slots)

# Booking Endpoints

@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_new_booking(
    booking_in: BookingCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new service booking for the current user.
    """
    return booking_service.create_booking(db=db, user_id=current_user.id, booking_in=booking_in)

@router.get("/me", response_model=List[BookingResponse])
def list_my_bookings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all bookings made by the current authenticated user.
    """
    return booking_service.get_user_bookings(db=db, user_id=current_user.id)

@router.get("/history", response_model=List[BookingHistoryItem])
def get_bookings_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve booking history for the current authenticated user.
    """
    return booking_service.get_booking_history(db=db, user_id=current_user.id)

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking_details(
    booking_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve details of a specific booking belonging to the current user.
    """
    db_booking = booking_service.get_booking(db=db, booking_id=booking_id, user_id=current_user.id)
    if not db_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    return db_booking

@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking_details(
    booking_id: UUID,
    booking_in: BookingUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a booking's details (e.g. reschedule date/timeslot, add notes, or change status).
    """
    db_booking = booking_service.update_booking(
        db=db, booking_id=booking_id, booking_in=booking_in, user_id=current_user.id
    )
    if not db_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    return db_booking

@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_and_delete_booking(
    booking_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a booking.
    """
    success = booking_service.delete_booking(db=db, booking_id=booking_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    return

# Timeslot Endpoints
@router.post("/timeslots", response_model=TimeslotResponse, status_code=status.HTTP_201_CREATED)
def create_new_timeslot(
    timeslot_in: TimeslotCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new timeslot for a service.
    """
    return booking_service.create_timeslot(db=db, timeslot_in=timeslot_in)

@router.get("/timeslots/service/{service_id}", response_model=List[TimeslotResponse])
def get_service_timeslots_list(
    service_id: UUID,
    only_active: bool = True,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all timeslots for a specific service.
    """
    return booking_service.get_service_timeslots(db=db, service_id=service_id, only_active=only_active)

@router.get("/timeslots/{timeslot_id}", response_model=TimeslotResponse)
def get_timeslot_details(
    timeslot_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve details of a specific timeslot.
    """
    db_timeslot = booking_service.get_timeslot(db=db, timeslot_id=timeslot_id)
    if not db_timeslot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeslot not found"
        )
    return db_timeslot

@router.put("/timeslots/{timeslot_id}", response_model=TimeslotResponse)
def update_timeslot_details(
    timeslot_id: UUID,
    timeslot_in: TimeslotUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a timeslot.
    """
    db_timeslot = booking_service.update_timeslot(db=db, timeslot_id=timeslot_id, timeslot_in=timeslot_in)
    if not db_timeslot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeslot not found"
        )
    return db_timeslot

@router.delete("/timeslots/{timeslot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timeslot_record(
    timeslot_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a timeslot.
    """
    success = booking_service.delete_timeslot(db=db, timeslot_id=timeslot_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeslot not found"
        )
    return
