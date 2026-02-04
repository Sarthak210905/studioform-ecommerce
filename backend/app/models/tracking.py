from datetime import datetime
from typing import Optional, List
from beanie import Document
from pydantic import Field

class RecentlyViewed(Document):
    """Track recently viewed products per user"""
    user_id: str
    product_id: str
    product_name: str
    product_image: Optional[str] = None
    product_price: float
    viewed_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "recently_viewed"
        indexes = [
            [("user_id", 1), ("viewed_at", -1)],
            [("user_id", 1), ("product_id", 1)],
        ]

class PriceAlert(Document):
    """Price drop alerts for wishlist items"""
    user_id: str
    product_id: str
    original_price: float
    alert_price: float  # Alert when price drops below this
    is_triggered: bool = False
    triggered_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "price_alerts"
        indexes = [
            [("user_id", 1), ("product_id", 1)],
            [("is_triggered", 1)],
        ]
