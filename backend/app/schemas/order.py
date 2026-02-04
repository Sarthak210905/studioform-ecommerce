from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ShippingAddress(BaseModel):
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    country: str = "India"

class OrderItemResponse(BaseModel):
    product_id: str
    product_name: str
    product_price: float
    original_price: Optional[float] = None
    discount_percentage: float = 0.0
    quantity: int
    image_url: Optional[str] = None
    subtotal: float

class CreateOrder(BaseModel):
    shipping_address: ShippingAddress
    payment_method: str = Field(..., pattern="^(cod|razorpay)$")  # UPDATED
    coupon_code: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    order_number: str
    items: List[OrderItemResponse]
    subtotal: float
    shipping_cost: float
    tax: float
    discount_amount: float
    coupon_code: Optional[str]
    total_amount: float
    status: str
    payment_method: Optional[str]
    payment_status: str
    shipping_address: ShippingAddress
    shipping_zone: Optional[str]
    estimated_delivery: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderSummary(BaseModel):
    id: str
    order_number: str
    total_amount: float
    status: str
    payment_status: str
    created_at: datetime
    items_count: int

class UpdateOrderStatus(BaseModel):
    status: str = Field(..., pattern="^(pending|processing|shipped|delivered|cancelled)$")
