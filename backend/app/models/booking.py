import uuid
import enum
import random
import string
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, ForeignKey, Numeric, UUID, DateTime, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

def generate_booking_reference() -> str:
    """
    Generates a unique uppercase alphanumeric reference code prefixed with 'UP-'.
    """
    chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"UP-{chars}"

class Booking(BaseModel):

    """
    Booking database model representing a client's booking for a service.
    """
    __tablename__ = "bookings"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Foreign key to the user who made the booking"
    )
    service_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Foreign key to the service being booked"
    )
    address_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("addresses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        doc="Foreign key to the address of the booking"
    )
    booking_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        doc="Scheduled date and time for the service booking"
    )
    timeslot_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("timeslots.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        doc="Foreign key to the timeslot of the booking"
    )
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="booking_status_enum", native_enum=False),
        default=BookingStatus.PENDING,
        nullable=False,
        doc="Current status of the booking"
    )
    total_price: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        doc="Total price for the booking"
    )
    notes: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="Extra notes/instructions for the booking"
    )
    booking_reference: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        default=generate_booking_reference,
        doc="Unique user-friendly reference code for the booking"
    )
    photos: Mapped[Optional[list[str]]] = mapped_column(
        JSON,
        nullable=True,
        default=list,
        doc="List of uploaded photo URLs for the booking"
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="bookings",
        doc="User who created this booking"
    )
    service: Mapped["Service"] = relationship(
        "Service",
        back_populates="bookings",
        doc="Service being booked"
    )
    address: Mapped[Optional["Address"]] = relationship(
        "Address",
        doc="Address details for the booking"
    )
    timeslot: Mapped[Optional["Timeslot"]] = relationship(
        "Timeslot",
        back_populates="bookings",
        doc="Timeslot details for the booking"
    )
    payment: Mapped[Optional["Payment"]] = relationship(
        "Payment",
        back_populates="booking",
        cascade="all, delete-orphan",
        uselist=False,
        doc="Payment associated with this booking"
    )

    @property
    def booking_id(self) -> uuid.UUID:
        return self.id

    @property
    def booking_status(self) -> BookingStatus:
        return self.status

    @property
    def payment_method(self) -> Optional[str]:
        return self.payment.payment_method if self.payment else None


