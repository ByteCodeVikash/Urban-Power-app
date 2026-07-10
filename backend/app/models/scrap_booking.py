import uuid
import enum
import random
import string
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, ForeignKey, Float, Numeric, UUID, DateTime, Enum, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class ScrapBookingStatus(str, enum.Enum):
    REQUESTED = "requested"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


def generate_scrap_booking_reference() -> str:
    """
    Generates a unique uppercase alphanumeric reference code prefixed with 'SC-'.
    """
    chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"SC-{chars}"


class ScrapBooking(BaseModel):
    """
    Database model representing a scrap pickup booking (Kabadi).
    Separate from the main bookings table to avoid FK conflicts with services.id.
    """
    __tablename__ = "scrap_bookings"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Foreign key to the user who made the pickup request"
    )
    scrap_item_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("scrap_items.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        doc="Foreign key to the primary scrap item being picked up"
    )
    address_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("addresses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        doc="Foreign key to the pickup address (if saved)"
    )
    address_text: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="Free-text pickup address (for custom addresses not saved in DB)"
    )
    booking_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        doc="Scheduled pickup date and time"
    )
    time_slot: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        doc="Time slot string (e.g. 'Morning (9-12)', 'Afternoon (12-4)')"
    )
    category_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="Name of the scrap category (e.g. Paper, Plastic)"
    )
    item_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="Name of the scrap item (e.g. Newspaper, Plastic Bottles)"
    )
    estimated_weight_kg: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        doc="Customer-estimated weight in kg"
    )
    estimated_value: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        doc="Estimated payout value for the pickup"
    )
    price_per_kg: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        doc="Rate per kg at time of booking"
    )
    status: Mapped[ScrapBookingStatus] = mapped_column(
        Enum(ScrapBookingStatus, name="scrap_booking_status_enum", native_enum=False),
        default=ScrapBookingStatus.REQUESTED,
        nullable=False,
        doc="Current status of the scrap pickup request"
    )
    customer_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="Customer's full name as entered in the booking form"
    )
    customer_phone: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        doc="Customer's phone number as entered in the booking form"
    )
    notes: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="Extra pickup instructions"
    )
    photos: Mapped[Optional[list]] = mapped_column(
        JSON,
        nullable=True,
        default=list,
        doc="List of uploaded photo URLs for the scrap"
    )
    booking_reference: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        default=generate_scrap_booking_reference,
        doc="Unique user-friendly reference code (e.g. SC-XXXXXX)"
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        doc="User who created this scrap booking"
    )
