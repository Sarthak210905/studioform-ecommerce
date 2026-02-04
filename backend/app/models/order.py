from datetime import datetime
from typing import List, Optional
from beanie import Document
from pydantic import BaseModel, Field

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    product_price: float  # Final price after product discount
    original_price: Optional[float] = None  # Original price before discount
    discount_percentage: float = 0.0  # Product discount percentage
    quantity: int
    image_url: Optional[str] = None
    subtotal: float

class Order(Document):
    user_id: str = Field(..., index=True)
    order_number: str = Field(..., unique=True, index=True)
    
    # Items
    items: List[OrderItem]
    
    # Pricing
    subtotal: float
    shipping_cost: float = 0.0
    tax: float = 0.0
    discount_amount: float = 0.0  # NEW
    coupon_code: Optional[str] = None  # NEW
    total_amount: float
    
    # Status
    status: str = Field(default="pending")
    
    # Payment
    payment_method: Optional[str] = None
    payment_status: str = Field(default="pending")
    payment_id: Optional[str] = None
    
    # Shipping Address
    shipping_address: dict
    shipping_zone: Optional[str] = None  # NEW
    estimated_delivery: Optional[str] = None  # NEW
    
    # Delhivery Integration
    delhivery_waybill: Optional[str] = None
    tracking_id: Optional[str] = None
    tracking_url: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "orders"
