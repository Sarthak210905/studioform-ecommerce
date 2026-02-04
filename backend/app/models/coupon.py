from datetime import datetime
from typing import Optional, List
from beanie import Document
from pydantic import Field

class Coupon(Document):
    code: str = Field(..., unique=True, index=True)
    description: Optional[str] = None
    
    # Discount
    discount_type: str  # "percentage" or "flat"
    discount_value: float  # percentage (0-100) or flat amount
    
    # Conditions
    min_order_amount: float = 0.0
    max_discount_amount: Optional[float] = None  # For percentage discounts
    
    # Usage
    usage_limit: Optional[int] = None  # Total uses allowed (None = unlimited)
    usage_count: int = 0  # Times used
    per_user_limit: Optional[int] = None  # Uses per user (None = unlimited)
    used_by: List[str] = []  # List of user IDs who used it
    
    # Validity
    is_active: bool = True
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None  # Admin user ID
    
    class Settings:
        name = "coupons"
    
    def is_valid(self) -> bool:
        """Check if coupon is valid"""
        if not self.is_active:
            return False
        
        now = datetime.utcnow()
        
        if self.starts_at and now < self.starts_at:
            return False
        
        if self.expires_at and now > self.expires_at:
            return False
        
        if self.usage_limit and self.usage_count >= self.usage_limit:
            return False
        
        return True
    
    def can_user_use(self, user_id: str) -> bool:
        """Check if user can use this coupon"""
        if not self.is_valid():
            return False
        
        if self.per_user_limit:
            user_usage = self.used_by.count(user_id)
            if user_usage >= self.per_user_limit:
                return False
        
        return True
    
    def calculate_discount(self, subtotal: float) -> float:
        """Calculate discount amount"""
        if self.discount_type == "flat":
            return min(self.discount_value, subtotal)
        else:  # percentage
            discount = subtotal * (self.discount_value / 100)
            if self.max_discount_amount:
                discount = min(discount, self.max_discount_amount)
            return round(discount, 2)
