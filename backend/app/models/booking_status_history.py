import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, UUID, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.database import Base


class BookingStatusHistory(Base):
    """
    Audit log table that records every status change for any booking type.
    Uses a composite (booking_id, booking_type) natural key instead of FK
    constraints so that it can reference bookings, scrap_bookings, and
    maintenance_bookings without cross-table FK complexity.
    """
    __tablename__ = "booking_status_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        doc="Unique identifier for the history entry"
    )
    booking_id: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
        doc="UUID string of the booking (no FK — references any booking table)"
    )
    booking_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        doc="Type of booking: beautician | scrap | maintenance"
    )
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        doc="Status value at this point in time"
    )
    updated_by: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
        doc="UUID string of the admin user who made this change"
    )
    updated_by_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="Display name of the admin who made this change (snapshot)"
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="Optional notes/reason for this status change"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        doc="Timestamp when this history entry was created"
    )
