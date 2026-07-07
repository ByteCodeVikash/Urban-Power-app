"""
Razorpay payment endpoints.

POST /api/v1/payments/create-order  – create a Razorpay order for a booking
POST /api/v1/payments/verify        – verify signature and mark payment complete
"""
import hmac
import hashlib
import uuid as _uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment
from app.schemas.payment import (
    PaymentCreateOrder,
    PaymentCreateOrderResponse,
    PaymentVerify,
    PaymentResponse,
)

router = APIRouter(prefix="/payments", tags=["Payments"])


def _razorpay_client():
    """Return a live Razorpay client, or None when keys are not configured."""
    key_id = getattr(settings, "RAZORPAY_KEY_ID", "") or ""
    key_secret = getattr(settings, "RAZORPAY_KEY_SECRET", "") or ""
    if key_id and key_secret:
        try:
            import razorpay  # type: ignore
            return razorpay.Client(auth=(key_id, key_secret))
        except Exception:
            pass
    return None


# ---------------------------------------------------------------------------
# POST /payments/create-order
# ---------------------------------------------------------------------------

@router.post(
    "/create-order",
    response_model=PaymentCreateOrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_payment_order(
    payload: PaymentCreateOrder,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Validates the booking, creates a Razorpay order (or a mock order in dev),
    persists a pending Payment row, and returns the order details the client
    needs to open the checkout sheet.
    """
    # 1. Validate booking belongs to user and is payable
    booking: Optional[Booking] = (
        db.query(Booking)
        .filter(
            Booking.id == payload.booking_id,
            Booking.user_id == current_user.id,
        )
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status == BookingStatus.CANCELLED:
        raise HTTPException(
            status_code=400,
            detail="Cannot create payment order for a cancelled booking",
        )

    if round(float(booking.total_price), 2) != round(payload.amount, 2):
        raise HTTPException(
            status_code=400,
            detail=f"Amount does not match booking total. Expected {booking.total_price}",
        )

    # 2. Create Razorpay order (or sandbox mock)
    rz_client = _razorpay_client()
    if rz_client:
        try:
            rz_order = rz_client.order.create(
                {
                    "amount": int(payload.amount * 100),  # paise
                    "currency": "INR",
                    "payment_capture": 1,
                    "notes": {"booking_id": str(booking.id)},
                }
            )
            order_id: str = rz_order["id"]
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Razorpay error: {exc}")
    else:
        order_id = f"order_mock_{_uuid.uuid4().hex[:16]}"

    # 3. Persist pending Payment (store order_id in transaction_id temporarily)
    # Check if a payment already exists for this booking (unique constraint on booking_id)
    existing_payment: Optional[Payment] = (
        db.query(Payment).filter(Payment.booking_id == booking.id).first()
    )
    if existing_payment:
        # If already completed, reject re-payment
        if existing_payment.payment_status == "completed":
            raise HTTPException(status_code=400, detail="Payment already completed for this booking")
        # Reuse existing pending payment row but update order_id
        existing_payment.transaction_id = order_id
        existing_payment.amount = payload.amount
        db.commit()
        db.refresh(existing_payment)
        payment = existing_payment
    else:
        payment = Payment(
            booking_id=booking.id,
            user_id=current_user.id,
            payment_method="razorpay",
            payment_status="pending",
            amount=payload.amount,
            transaction_id=order_id,   # re-used to store order_id until verification
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

    return PaymentCreateOrderResponse(
        order_id=order_id,
        amount=payload.amount,
        currency="INR",
        payment_id=str(payment.id),
    )


# ---------------------------------------------------------------------------
# POST /payments/verify
# ---------------------------------------------------------------------------

@router.post("/verify", response_model=PaymentResponse)
def verify_payment(
    payload: PaymentVerify,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Verifies the Razorpay HMAC signature, updates the Payment row to
    'completed', and transitions the Booking to 'confirmed'.
    """
    # 1. Find the pending Payment by the order_id we stored in transaction_id
    payment: Optional[Payment] = (
        db.query(Payment)
        .filter(Payment.transaction_id == payload.razorpay_order_id)
        .first()
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    # 2. Verify HMAC signature (bypass for mock order IDs)
    key_secret = getattr(settings, "RAZORPAY_KEY_SECRET", "") or ""
    is_mock = payload.razorpay_order_id.startswith("order_mock_")

    if key_secret and not is_mock:
        body = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"
        expected = hmac.new(
            key_secret.encode(), body.encode(), hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(expected, payload.razorpay_signature):
            raise HTTPException(status_code=400, detail="Invalid payment signature")

    # 3. Update Payment: store real payment_id in transaction_id
    payment.transaction_id = payload.razorpay_payment_id
    payment.payment_status = "completed"

    # 4. Confirm the Booking
    booking: Optional[Booking] = (
        db.query(Booking).filter(Booking.id == payment.booking_id).first()
    )
    if booking:
        booking.status = BookingStatus.CONFIRMED

    db.commit()
    db.refresh(payment)

    return PaymentResponse(
        payment_id=str(payment.id),
        booking_id=str(payment.booking_id),
        payment_status="completed",
        transaction_id=payload.razorpay_payment_id,
        amount=float(payment.amount),
        currency="INR",
    )
