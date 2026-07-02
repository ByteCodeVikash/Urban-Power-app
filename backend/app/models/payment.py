import uuid
from typing import Optional
from sqlalchemy import String, ForeignKey, Numeric, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

class Payment(BaseModel):
    """
    Payment database model representing payments made for service bookings.
    """
    __tablename__ = "payments"

    booking_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("bookings.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
        doc="Foreign key reference to the related booking"
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Foreign key reference to the user who paid"
    )
    payment_method: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        doc="Method used for payment (e.g., cash, card, razorpay, upi)"
    )
    payment_status: Mapped[str] = mapped_column(
        String(50),
        default="pending",
        nullable=False,
        doc="Status of the payment (e.g., pending, completed, failed, refunded)"
    )
    amount: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        doc="Payment amount"
    )
    transaction_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=True,
        doc="Transaction reference ID from payment gateway (e.g., Razorpay payment id)"
    )

    # Relationships
    booking: Mapped["Booking"] = relationship(
        "Booking",
        back_populates="payment",
        doc="Booking associated with this payment"
    )
    user: Mapped["User"] = relationship(
        "User",
        back_populates="payments",
        doc="User who made this payment"
    )
