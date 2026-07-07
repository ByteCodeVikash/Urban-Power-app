from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

from app.models.maintenance_booking import MaintenanceBookingStatus


class MaintenanceBookingCreate(BaseModel):
    """
    Pydantic schema for creating a new maintenance service booking.
    """
    address_id: Optional[UUID] = Field(None, description="FK to the saved service address")
    address_text: Optional[str] = Field(None, max_length=1024, description="Free-text service address")
    booking_date: datetime = Field(..., description="Scheduled service date")
    service_ids: Optional[List[str]] = Field(default_factory=list, description="List of maintenance_service IDs")
    service_names: Optional[List[str]] = Field(default_factory=list, description="Snapshot of service names")
    total_price: float = Field(..., ge=0, description="Total price for all selected services")
    notes: Optional[str] = Field(None, max_length=1024, description="Extra service instructions")
    photos: Optional[List[str]] = Field(default_factory=list, description="Uploaded reference photo URLs")
    customer_name: Optional[str] = Field(None, max_length=255, description="Customer name")
    customer_phone: Optional[str] = Field(None, max_length=20, description="Customer phone number")


class MaintenanceBookingUpdate(BaseModel):
    """
    Pydantic schema for updating a maintenance booking. All fields optional.
    """
    status: Optional[MaintenanceBookingStatus] = Field(None, description="Updated status")
    notes: Optional[str] = Field(None, max_length=1024, description="Updated notes")
    address_text: Optional[str] = Field(None, max_length=1024, description="Updated address")


class MaintenanceBookingResponse(BaseModel):
    """
    Pydantic schema for returning maintenance booking information.
    """
    id: UUID
    booking_reference: str
    user_id: UUID
    address_id: Optional[UUID] = None
    address_text: Optional[str] = None
    booking_date: datetime
    service_ids: Optional[List[str]] = None
    service_names: Optional[List[str]] = None
    total_price: float
    status: MaintenanceBookingStatus
    notes: Optional[str] = None
    photos: Optional[List[str]] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
