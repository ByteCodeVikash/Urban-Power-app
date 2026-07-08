from datetime import datetime, timedelta
from typing import List, Optional, Any
from uuid import UUID
from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.booking import Booking, BookingStatus
from app.models.timeslot import Timeslot
from app.models.service import Service
from app.schemas.booking import BookingCreate, BookingUpdate
from app.schemas.timeslot import TimeslotCreate, TimeslotUpdate

from app.models.address import Address
from app.models.payment import Payment
from app.models.booking_status_history import BookingStatusHistory

# Booking Operations
def create_booking(db: Session, user_id: UUID, booking_in: BookingCreate) -> Booking:
    """
    Create a new booking for a user with validations.
    """
    # 1. Validate service exists & is active
    service = db.query(Service).filter(Service.id == booking_in.service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    if not service.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service is inactive"
        )

    # 2. Validate address exists and belongs to the user
    address = db.query(Address).filter(Address.id == booking_in.address_id, Address.user_id == user_id).first()
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found or does not belong to the user"
        )

    # 3. Validate timeslot exists, is active and belongs to the service
    timeslot = db.query(Timeslot).filter(
        Timeslot.id == booking_in.timeslot_id,
        Timeslot.service_id == booking_in.service_id
    ).first()
    if not timeslot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeslot not found or does not belong to the service"
        )
    if not timeslot.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Timeslot is inactive"
        )

    # 4. Validate booking date is not in the past
    booking_date_utc = booking_in.booking_date
    today = datetime.utcnow().date()
    current_time = datetime.utcnow().time()
    
    target_date = booking_date_utc.date()
    
    if target_date < today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking date cannot be in the past"
        )
    elif target_date == today:
        # Check if timeslot start_time is in the past
        if timeslot.start_time <= current_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Timeslot is already in the past for today"
            )

    # 5. Validate timeslot is available (not booked by a non-cancelled booking on this date)
    existing_booking = db.query(Booking).filter(
        Booking.service_id == booking_in.service_id,
        Booking.timeslot_id == booking_in.timeslot_id,
        func.date(Booking.booking_date) == target_date,
        Booking.status != BookingStatus.CANCELLED
    ).first()
    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Timeslot is already booked for this date"
        )

    # Build booking model data
    booking_data = booking_in.model_dump()
    payment_method = booking_data.pop("payment_method", None)
    booking_data["user_id"] = user_id

    # Resolve pricing and status defaults/overrides
    if booking_data.get("total_price") is None:
        booking_data["total_price"] = service.price
    if booking_data.get("status") is None:
        booking_data["status"] = BookingStatus.PENDING

    db_booking = Booking(**booking_data)
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    # Create associated payment record if payment_method is provided
    if payment_method:
        payment = Payment(
            booking_id=db_booking.id,
            user_id=user_id,
            payment_method=payment_method,
            payment_status="pending",
            amount=db_booking.total_price
        )
        db.add(payment)
        db.commit()
        db.refresh(db_booking)

    return db_booking


def get_booking(db: Session, booking_id: UUID, user_id: Optional[UUID] = None) -> Optional[Booking]:
    """
    Retrieve a booking by ID. Optionally filter by user_id to enforce access control.
    """
    query = db.query(Booking).filter(Booking.id == booking_id)
    if user_id:
        query = query.filter(Booking.user_id == user_id)
    return query.first()

def get_user_bookings(db: Session, user_id: UUID) -> List[Booking]:
    """
    List all bookings belonging to a user, ordered by booking_date descending.
    """
    return db.query(Booking).filter(Booking.user_id == user_id).order_by(Booking.booking_date.desc()).all()

def update_booking(db: Session, booking_id: UUID, booking_in: BookingUpdate, user_id: Optional[UUID] = None) -> Optional[Booking]:
    """
    Update an existing booking. Optionally filter by user_id.
    """
    db_booking = get_booking(db, booking_id, user_id)
    if not db_booking:
        return None
    
    update_data = booking_in.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(db_booking, key, val)
        
    db.commit()
    db.refresh(db_booking)
    return db_booking

def delete_booking(db: Session, booking_id: UUID, user_id: Optional[UUID] = None) -> bool:
    """
    Delete a booking.
    """
    db_booking = get_booking(db, booking_id, user_id)
    if not db_booking:
        return False
    db.delete(db_booking)
    db.commit()
    return True

# Timeslot Operations
def create_timeslot(db: Session, timeslot_in: TimeslotCreate) -> Timeslot:
    """
    Create a new timeslot.
    """
    db_timeslot = Timeslot(**timeslot_in.model_dump())
    db.add(db_timeslot)
    db.commit()
    db.refresh(db_timeslot)
    return db_timeslot

def get_timeslot(db: Session, timeslot_id: UUID) -> Optional[Timeslot]:
    """
    Retrieve a timeslot by ID.
    """
    return db.query(Timeslot).filter(Timeslot.id == timeslot_id).first()

def get_service_timeslots(db: Session, service_id: UUID, only_active: bool = True) -> List[Timeslot]:
    """
    List timeslots for a specific service.
    """
    query = db.query(Timeslot).filter(Timeslot.service_id == service_id)
    if only_active:
        query = query.filter(Timeslot.active == True)
    return query.order_by(Timeslot.start_time.asc()).all()

def update_timeslot(db: Session, timeslot_id: UUID, timeslot_in: TimeslotUpdate) -> Optional[Timeslot]:
    """
    Update an existing timeslot.
    """
    db_timeslot = get_timeslot(db, timeslot_id)
    if not db_timeslot:
        return None
    
    update_data = timeslot_in.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(db_timeslot, key, val)
        
    db.commit()
    db.refresh(db_timeslot)
    return db_timeslot

def delete_timeslot(db: Session, timeslot_id: UUID) -> bool:
    """
    Delete a timeslot.
    """
    db_timeslot = get_timeslot(db, timeslot_id)
    if not db_timeslot:
        return False
    db.delete(db_timeslot)
    db.commit()
    return True


def get_available_dates(db: Session, service_id: UUID) -> List[str]:
    """
    Get available booking dates for a service over the next 14 days.
    """
    # 1. Validate service exists
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # 2. Validate service is active
    if not service.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service is inactive"
        )
    
    # 3. Get active timeslots
    active_timeslots = db.query(Timeslot).filter(
        Timeslot.service_id == service_id,
        Timeslot.active == True
    ).all()
    
    if not active_timeslots:
        return []
    
    # 4. Fetch non-cancelled bookings in the next 14 days
    today = datetime.utcnow().date()
    end_date = today + timedelta(days=13)
    
    bookings = db.query(Booking).filter(
        Booking.service_id == service_id,
        Booking.status != BookingStatus.CANCELLED,
        func.date(Booking.booking_date) >= today,
        func.date(Booking.booking_date) <= end_date
    ).all()
    
    booked_slots = {(b.booking_date.date(), b.timeslot_id) for b in bookings if b.timeslot_id}
    
    # 5. Compute available dates
    available_dates = []
    current_time = datetime.utcnow().time()
    
    for i in range(14):
        target_date = today + timedelta(days=i)
        date_is_available = False
        
        for timeslot in active_timeslots:
            # If checking today, ensure timeslot start_time is in the future
            if target_date == today:
                if timeslot.start_time <= current_time:
                    continue
            
            if (target_date, timeslot.id) not in booked_slots:
                date_is_available = True
                break
        
        if date_is_available:
            available_dates.append(target_date.strftime("%Y-%m-%d"))
            
    return available_dates


def get_available_timeslots(db: Session, service_id: UUID, date_str: str) -> List[dict]:
    """
    Get all active timeslots for a service on a given date and determine if they are available.
    """
    # 1. Validate service exists
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # 2. Validate service is active
    if not service.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service is inactive"
        )
        
    # 3. Parse date
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Expected YYYY-MM-DD."
        )
        
    # 4. Fetch active timeslots for this service
    active_timeslots = db.query(Timeslot).filter(
        Timeslot.service_id == service_id,
        Timeslot.active == True
    ).order_by(Timeslot.start_time.asc()).all()
    
    # 5. Fetch non-cancelled bookings for this service on this specific date
    bookings = db.query(Booking).filter(
        Booking.service_id == service_id,
        Booking.status != BookingStatus.CANCELLED,
        func.date(Booking.booking_date) == target_date
    ).all()
    
    booked_timeslot_ids = {b.timeslot_id for b in bookings if b.timeslot_id}
    
    # 6. Check if target date is today to filter out past slots
    today = datetime.utcnow().date()
    current_time = datetime.utcnow().time()
    
    available_timeslots = []
    for slot in active_timeslots:
        available = True
        
        # If already booked
        if slot.id in booked_timeslot_ids:
            available = False
        # If target date is in the past
        elif target_date < today:
            available = False
        # If target date is today, check if start_time is in the past
        elif target_date == today:
            if slot.start_time <= current_time:
                available = False
                
        available_timeslots.append({
            "id": slot.id,
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "available": available
        })
        
    return available_timeslots


def get_latest_status(db: Session, booking_id: UUID, booking_type: str, fallback_status: Any) -> str:
    """
    Retrieve the latest unmapped booking status from the status history audit log.
    If no history entry is found, fallback to the database booking status.
    """
    row = (
        db.query(BookingStatusHistory)
        .filter(
            BookingStatusHistory.booking_id == str(booking_id),
            BookingStatusHistory.booking_type == booking_type,
        )
        .order_by(BookingStatusHistory.created_at.desc())
        .first()
    )
    if row:
        return row.status
    return fallback_status.value if hasattr(fallback_status, "value") else str(fallback_status)


def get_booking_history(db: Session, user_id: UUID) -> List[dict]:
    """
    Retrieve booking history for a user, formatted for the history screen.
    """
    bookings = db.query(Booking).filter(Booking.user_id == user_id).order_by(Booking.booking_date.desc()).all()
    history = []
    for b in bookings:
        timeslot_str = ""
        if b.timeslot:
            timeslot_str = f"{b.timeslot.start_time.strftime('%H:%M:%S')} - {b.timeslot.end_time.strftime('%H:%M:%S')}"
        
        status_val = get_latest_status(db, b.id, "beautician", b.status)
        
        history.append({
            "booking_id": b.id,
            "service": b.service.name if b.service else "Unknown Service",
            "date": b.booking_date.strftime("%Y-%m-%d"),
            "timeslot": timeslot_str,
            "status": status_val,
            "payment_method": b.payment_method
        })
    return history


