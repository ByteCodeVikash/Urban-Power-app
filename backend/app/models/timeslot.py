import uuid
from datetime import time
from typing import List
from sqlalchemy import ForeignKey, Boolean, Time, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

class Timeslot(BaseModel):
    """
    Timeslot database model representing available time windows for services.
    """
    __tablename__ = "timeslots"

    service_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Foreign key to the service this timeslot belongs to"
    )
    start_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
        doc="Start time of the timeslot"
    )
    end_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
        doc="End time of the timeslot"
    )
    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        doc="Indicates whether the timeslot is active"
    )

    # Relationships
    service: Mapped["Service"] = relationship(
        "Service",
        back_populates="timeslots",
        doc="Service this timeslot belongs to"
    )
    bookings: Mapped[List["Booking"]] = relationship(
        "Booking",
        back_populates="timeslot",
        doc="Bookings scheduled in this timeslot"
    )
