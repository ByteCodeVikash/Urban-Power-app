import uuid
from typing import Optional
from sqlalchemy import String, ForeignKey, Boolean, Float, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

class Address(BaseModel):
    """
    Address database model representing a user's saved address.
    """
    __tablename__ = "addresses"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Foreign key to the user who owns this address"
    )
    address_type: Mapped[str] = mapped_column(
        String(50),
        default="Home",
        nullable=False,
        doc="Type of address (e.g., Home, Work, Other)"
    )
    house_number: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="House, flat, or building number"
    )
    landmark: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="Nearby landmark"
    )
    street: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Street name or locality"
    )
    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        doc="City name"
    )
    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        doc="State name"
    )
    pincode: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        doc="Postal PIN code"
    )
    latitude: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        doc="Geographic latitude coordinate"
    )
    longitude: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        doc="Geographic longitude coordinate"
    )
    is_default: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        doc="Indicates whether this is the user's primary/default address"
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="addresses",
        doc="User who owns this address"
    )
