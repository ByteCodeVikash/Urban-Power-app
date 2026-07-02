import uuid
from typing import Optional, List
from sqlalchemy import String, Boolean, ForeignKey, Numeric, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

class Service(BaseModel):
    """
    Service database model representing individual services offered.
    """
    __tablename__ = "services"

    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Foreign key to the category this service belongs to"
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        doc="Name of the service"
    )
    description: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="Detailed description of the service"
    )
    duration: Mapped[Optional[int]] = mapped_column(
        doc="Duration of the service in minutes"
    )
    price: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        doc="Price for the service"
    )
    image: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="URL or path to the service's display image"
    )
    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        doc="Indicates whether the service is active"
    )

    category: Mapped["Category"] = relationship(
        "Category",
        back_populates="services",
        doc="Category this service belongs to"
    )

    bookings: Mapped[List["Booking"]] = relationship(
        "Booking",
        back_populates="service",
        cascade="all, delete-orphan",
        doc="Bookings associated with this service"
    )

    timeslots: Mapped[List["Timeslot"]] = relationship(
        "Timeslot",
        back_populates="service",
        cascade="all, delete-orphan",
        doc="Timeslots associated with this service"
    )

