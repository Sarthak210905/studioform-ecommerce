from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CouponCreate(BaseModel):
    code: str = Field(..., min_length=3, max_length=20)
    description: Optional[str] = None
    discount_type: str = Field(..., pattern="^(percentage|flat)$")
    discount_value: float = Field(..., gt=0)
    min_order_amount: float = Field(default=0.0, ge=0)
    max_discount_amount: Optional[float] = None
    usage_limit: Optional[int] = None
    per_user_limit: Optional[int] = None
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class CouponResponse(BaseModel):
    id: str
    code: str
    description: Optional[str]
    discount_type: str
    discount_value: float
    min_order_amount: float
    max_discount_amount: Optional[float]
    usage_limit: Optional[int]
    usage_count: int
    per_user_limit: Optional[int]
    is_active: bool
    starts_at: Optional[datetime]
    expires_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class ApplyCoupon(BaseModel):
    coupon_code: str

class CouponValidation(BaseModel):
    valid: bool
    message: str
    discount_amount: Optional[float] = None
    coupon_code: Optional[str] = None
