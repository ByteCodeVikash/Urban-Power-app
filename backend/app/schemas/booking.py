from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

from app.models.booking import BookingStatus

class BookingBase(BaseModel):
    """
    Base Pydantic schema for Booking containing shared attributes.
    """
    service_id: UUID = Field(..., description="Foreign key to the service being booked")
    address_id: Optional[UUID] = Field(None, description="Foreign key to the address of the booking")
    booking_date: datetime = Field(..., description="Scheduled date and time for the booking")
    timeslot_id: Optional[UUID] = Field(None, description="Foreign key to the timeslot of the booking")
    status: str = Field("pending", description="Current status of the booking")
    total_price: float = Field(..., ge=0.0, description="Total price for the booking")
    notes: Optional[str] = Field(None, max_length=1024, description="Extra notes/instructions for the booking")

class BookingCreate(BaseModel):
    """
    Pydantic schema for creating a new Booking.
    """
    service_id: UUID = Field(..., description="Foreign key to the service being booked")
    address_id: UUID = Field(..., description="Foreign key to the address of the booking")
    booking_date: datetime = Field(..., description="Scheduled date and time for the booking")
    timeslot_id: UUID = Field(..., description="Foreign key to the timeslot of the booking")
    notes: Optional[str] = Field(None, max_length=1024, description="Extra notes/instructions for the booking")
    photos: Optional[List[str]] = Field(default_factory=list, description="Uploaded photo URLs")
    payment_method: Optional[str] = Field(None, description="Payment method (e.g. cash, upi, razorpay)")

    # Optional fields for backward compatibility with existing tests
    status: Optional[BookingStatus] = Field(None, description="Current status of the booking")
    total_price: Optional[float] = Field(None, ge=0.0, description="Total price for the booking")

class BookingUpdate(BaseModel):
    """
    Pydantic schema for updating an existing Booking. All fields are optional.
    """
    address_id: Optional[UUID] = Field(None, description="Foreign key to the address of the booking")
    booking_date: Optional[datetime] = Field(None, description="Scheduled date and time for the booking")
    timeslot_id: Optional[UUID] = Field(None, description="Foreign key to the timeslot of the booking")
    status: Optional[BookingStatus] = Field(None, description="Current status of the booking")
    total_price: Optional[float] = Field(None, ge=0.0, description="Total price for the booking")
    notes: Optional[str] = Field(None, max_length=1024, description="Extra notes/instructions for the booking")

class BookingResponse(BookingBase):
    """
    Pydantic schema for returning Booking information.
    """
    id: UUID = Field(..., description="Unique identifier of the booking")
    booking_id: UUID = Field(..., description="Unique identifier of the booking (alias)")
    booking_status: str = Field(..., description="Current status of the booking (alias)")
    booking_reference: str = Field(..., description="Unique booking reference code")
    photos: Optional[List[str]] = Field(default_factory=list, description="Uploaded photo URLs")
    payment_method: Optional[str] = Field(None, description="Payment method used")
    user_id: UUID = Field(..., description="Unique identifier of the user who made the booking")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BookingCreateResponse(BaseModel):
    """
    Pydantic schema for the specific booking creation response.
    """
    booking_id: UUID = Field(..., description="Unique identifier of the booking")
    booking_status: BookingStatus = Field(..., description="Current status of the booking")
    booking_reference: str = Field(..., description="Unique booking reference code")

class AvailableDatesResponse(BaseModel):
    """
    Pydantic schema for returning available booking dates.
    """
    available_dates: List[str] = Field(..., description="List of available dates in YYYY-MM-DD format")


class BookingHistoryItem(BaseModel):
    """
    Pydantic schema for a booking history item.
    """
    booking_id: UUID = Field(..., description="Unique identifier of the booking")
    service: str = Field(..., description="Name of the service")
    date: str = Field(..., description="Date of the booking in YYYY-MM-DD format")
    timeslot: str = Field(..., description="Timeslot string representation")
    status: str = Field(..., description="Status of the booking")
    payment_method: Optional[str] = Field(None, description="Payment method used")



