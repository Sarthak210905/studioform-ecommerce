from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=100)
    comment: Optional[str] = Field(None, max_length=1000)

class ReviewResponse(BaseModel):
    id: str
    product_id: str
    user_id: str
    user_name: str
    rating: int
    title: Optional[str]
    comment: Optional[str]
    is_verified_purchase: bool
    helpful_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductRatingStats(BaseModel):
    average_rating: float
    total_reviews: int
    rating_distribution: dict  # {5: 10, 4: 5, 3: 2, 2: 1, 1: 0}
