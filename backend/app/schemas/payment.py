from pydantic import BaseModel
from typing import Optional

class CreateRazorpayOrder(BaseModel):
    order_id: str  # Your internal order ID

class VerifyPayment(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: str  # Your internal order ID

class RazorpayOrderResponse(BaseModel):
    razorpay_order_id: str
    amount: int  # in paise
    currency: str
    key_id: str

class PaymentWebhook(BaseModel):
    event: str
    payload: dict
