from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field

class Review(Document):
    product_id: str = Field(..., index=True)
    user_id: str = Field(..., index=True)
    user_name: str
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None
    images: list[str] = []
    is_verified_purchase: bool = False
    helpful_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "reviews"
