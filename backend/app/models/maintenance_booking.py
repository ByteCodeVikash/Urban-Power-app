import uuid
import enum
import random
import string
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, ForeignKey, Numeric, UUID, DateTime, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class MaintenanceBookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


def generate_maintenance_booking_reference() -> str:
    """
    Generates a unique uppercase alphanumeric reference code prefixed with 'MN-'.
    """
    chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"MN-{chars}"


class MaintenanceBooking(BaseModel):
    """
    Database model representing a maintenance service booking.
    Separate from the main bookings table to avoid FK conflicts with services.id.
    Supports multi-service bookings (e.g. AC Service + Fan Repair).
    """
    __tablename__ = "maintenance_bookings"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Foreign key to the user who made the booking"
    )
    address_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("addresses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        doc="Foreign key to the service address (if saved)"
    )
    address_text: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="Free-text service address"
    )
    booking_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        doc="Scheduled service date"
    )
    service_ids: Mapped[Optional[list]] = mapped_column(
        JSON,
        nullable=True,
        default=list,
        doc="List of maintenance_service UUIDs selected by the customer"
    )
    service_names: Mapped[Optional[list]] = mapped_column(
        JSON,
        nullable=True,
        default=list,
        doc="Snapshot of service names at time of booking"
    )
    total_price: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        doc="Total price for all selected maintenance services"
    )
    status: Mapped[MaintenanceBookingStatus] = mapped_column(
        Enum(MaintenanceBookingStatus, name="maintenance_booking_status_enum", native_enum=False),
        default=MaintenanceBookingStatus.PENDING,
        nullable=False,
        doc="Current status of the maintenance booking"
    )
    notes: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="Extra service instructions"
    )
    photos: Mapped[Optional[list]] = mapped_column(
        JSON,
        nullable=True,
        default=list,
        doc="List of uploaded reference photo URLs"
    )
    booking_reference: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        default=generate_maintenance_booking_reference,
        doc="Unique user-friendly reference code (e.g. MN-XXXXXX)"
    )
    customer_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="Customer name as entered during booking"
    )
    customer_phone: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        doc="Customer phone number as entered during booking"
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        doc="User who created this maintenance booking"
    )
