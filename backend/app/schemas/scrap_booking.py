from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

from app.models.scrap_booking import ScrapBookingStatus


class ScrapBookingCreate(BaseModel):
    """
    Pydantic schema for creating a new scrap pickup booking.
    """
    scrap_item_id: Optional[UUID] = Field(None, description="FK to the primary scrap item being picked up")
    address_id: Optional[UUID] = Field(None, description="FK to the saved pickup address")
    address_text: Optional[str] = Field(None, max_length=1024, description="Free-text pickup address")
    booking_date: datetime = Field(..., description="Scheduled pickup date and time")
    time_slot: Optional[str] = Field(None, max_length=100, description="Time slot string")
    category_name: Optional[str] = Field(None, max_length=255, description="Scrap category name")
    item_name: Optional[str] = Field(None, max_length=255, description="Scrap item name")
    estimated_weight_kg: Optional[float] = Field(None, ge=0, description="Estimated weight in kg")
    estimated_value: Optional[float] = Field(None, ge=0, description="Estimated payout value")
    price_per_kg: Optional[float] = Field(None, ge=0, description="Rate per kg at booking time")
    notes: Optional[str] = Field(None, max_length=1024, description="Extra instructions")
    photos: Optional[List[str]] = Field(default_factory=list, description="Uploaded photo URLs")
    customer_name: Optional[str] = Field(None, max_length=255, description="Customer name as entered in the form")
    customer_phone: Optional[str] = Field(None, max_length=20, description="Customer phone as entered in the form")


class ScrapBookingUpdate(BaseModel):
    """
    Pydantic schema for updating a scrap pickup booking. All fields optional.
    """
    status: Optional[ScrapBookingStatus] = Field(None, description="Updated status")
    notes: Optional[str] = Field(None, max_length=1024, description="Updated notes")
    address_text: Optional[str] = Field(None, max_length=1024, description="Updated address")


class ScrapBookingResponse(BaseModel):
    """
    Pydantic schema for returning scrap booking information.
    """
    id: UUID
    booking_reference: str
    user_id: UUID
    scrap_item_id: Optional[UUID] = None
    address_id: Optional[UUID] = None
    address_text: Optional[str] = None
    booking_date: datetime
    time_slot: Optional[str] = None
    category_name: Optional[str] = None
    item_name: Optional[str] = None
    estimated_weight_kg: Optional[float] = None
    estimated_value: Optional[float] = None
    price_per_kg: Optional[float] = None
    status: str
    notes: Optional[str] = None
    photos: Optional[List[str]] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
