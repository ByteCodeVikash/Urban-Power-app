from uuid import UUID
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class PaymentCreateOrder(BaseModel):
    """
    Pydantic schema for requesting a new Razorpay payment order.
    """
    booking_id: UUID = Field(..., description="The booking ID to pay for")
    amount: float = Field(..., description="The amount to pay in INR")

class PaymentCreateOrderResponse(BaseModel):
    """
    Pydantic schema for response after creating a Razorpay order.
    """
    order_id: str = Field(..., description="The Razorpay order ID")
    amount: float = Field(..., description="The order amount")
    currency: str = Field("INR", description="The currency (default INR)")
    payment_id: str = Field(..., description="The database Payment record ID")

class PaymentVerify(BaseModel):
    """
    Pydantic schema for verifying a completed Razorpay payment.
    """
    razorpay_order_id: str = Field(..., description="The Razorpay order ID")
    razorpay_payment_id: str = Field(..., description="The Razorpay payment ID")
    razorpay_signature: str = Field(..., description="The signature hash from Razorpay")

class PaymentResponse(BaseModel):
    """
    Pydantic schema for returning Payment detail.
    """
    payment_id: str = Field(..., description="Unique identifier of the payment record")
    booking_id: str = Field(..., description="Related booking ID")
    payment_status: str = Field(..., description="Status of the payment (e.g. completed)")
    transaction_id: Optional[str] = Field(None, description="Gateway transaction reference ID")
    amount: float = Field(..., description="Payment amount")
    currency: str = Field("INR", description="Currency code")

    model_config = ConfigDict(from_attributes=True)
