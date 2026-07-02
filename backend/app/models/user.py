import uuid
from typing import Optional, List
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

class User(BaseModel):
    """
    User database model representing application users (clients, admins, service providers).
    """
    __tablename__ = "users"

    full_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="Full name of the user"
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        doc="Primary email address of the user used for authentication"
    )
    phone: Mapped[Optional[str]] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=True,
        doc="Contact phone number of the user"
    )
    profile_image: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="URL or path to the user's profile image"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        doc="Indicates whether the user account is active"
    )
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        doc="Indicates whether the user's email/phone has been verified"
    )
    role: Mapped[str] = mapped_column(
        String(50),
        default="client",
        nullable=False,
        doc="Role of the user (e.g., client, provider, admin)"
    )

    # Future relationships
    # Uncomment these once the respective models (Booking, Address, Payment) are implemented.
    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="user", cascade="all, delete-orphan")
    addresses: Mapped[List["Address"]] = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    payments: Mapped[List["Payment"]] = relationship("Payment", back_populates="user", cascade="all, delete-orphan")
