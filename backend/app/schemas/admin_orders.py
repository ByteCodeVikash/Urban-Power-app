"""
admin_orders.py — Pydantic schemas for the Admin Order Management API.

These schemas return a normalized "AdminOrder" shape that merges data from:
  - bookings          (booking_type = "beautician")
  - scrap_bookings    (booking_type = "scrap")
  - maintenance_bookings (booking_type = "maintenance")
"""
from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict, Field


# ─── Status History ────────────────────────────────────────────────────────────

class StatusHistoryItem(BaseModel):
    """Single entry in the booking timeline."""
    status: str
    updated_by: Optional[str] = None
    updated_by_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── Normalized order (list view) ─────────────────────────────────────────────

class AdminOrderItem(BaseModel):
    """
    Normalized booking record returned by GET /admin/orders.
    All three booking types are flattened into this common shape.
    """
    booking_id: str
    booking_reference: str
    booking_type: str                   # "beautician" | "scrap" | "maintenance"

    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None

    # Address — resolved to readable text where possible
    address: Optional[str] = None

    # Service info (may differ per booking type)
    service_name: Optional[str] = None
    category: Optional[str] = None

    price: Optional[float] = None
    status: str
    created_at: datetime

    assigned_technician: Optional[str] = None
    payment_method: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ─── Paginated list response ───────────────────────────────────────────────────

class AdminOrderListResponse(BaseModel):
    items: List[AdminOrderItem]
    total: int
    page: int
    page_size: int
    total_pages: int


# ─── Single order detail ───────────────────────────────────────────────────────

class AdminOrderDetail(BaseModel):
    """
    Full booking detail returned by GET /admin/orders/{booking_type}/{id}.
    Includes all fields needed for the Order Details page.
    """
    booking_id: str
    booking_reference: str
    booking_type: str

    # Customer
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    customer_id: Optional[str] = None

    # Address
    address: Optional[str] = None
    address_id: Optional[str] = None
    address_details: Optional[dict] = None

    # Service / booking data
    service_name: Optional[str] = None
    service_id: Optional[str] = None
    category: Optional[str] = None

    # Scrap-specific
    item_name: Optional[str] = None
    category_name: Optional[str] = None
    estimated_weight_kg: Optional[float] = None
    estimated_value: Optional[float] = None
    time_slot: Optional[str] = None

    # Maintenance-specific
    service_names: Optional[List[str]] = None
    service_ids: Optional[List[str]] = None

    # Beautician-specific
    timeslot_id: Optional[str] = None
    timeslot_str: Optional[str] = None

    price: Optional[float] = None
    payment_method: Optional[str] = None

    status: str
    assigned_technician: Optional[str] = None

    photos: Optional[List[str]] = None
    notes: Optional[str] = None

    booking_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # Status timeline (newest-first)
    status_history: List[StatusHistoryItem] = []

    model_config = ConfigDict(from_attributes=True)


# ─── Status update payload ─────────────────────────────────────────────────────

class AdminOrderStatusUpdate(BaseModel):
    """Body for PATCH /admin/orders/{booking_type}/{id}."""
    status: str = Field(..., description="New status value")
    notes: Optional[str] = Field(None, description="Optional reason or notes for this change")
    assigned_technician: Optional[str] = Field(None, description="Assign or change technician name")


# ─── Statistics ───────────────────────────────────────────────────────────────

class BookingTypeStats(BaseModel):
    total: int
    pending: int
    confirmed: int
    assigned: int
    in_progress: int
    completed: int
    cancelled: int


class AdminOrderStatistics(BaseModel):
    total_all: int
    beautician: BookingTypeStats
    scrap: BookingTypeStats
    maintenance: BookingTypeStats
    recent_statuses: dict = Field(
        default_factory=dict,
        description="Count by status across all booking types"
    )
