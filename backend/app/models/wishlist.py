from datetime import datetime, timezone
from beanie import Document
from pydantic import Field
from typing import Optional

class WishlistItem(Document):
    user_id: str
    product_id: str
    product_name: Optional[str] = None
    product_price: Optional[float] = None
    image_url: Optional[str] = None
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Price tracking for alerts
    last_known_price: Optional[float] = None
    last_stock_alert: Optional[datetime] = None
    
    class Settings:
        name = "wishlist"
        indexes = [
            [("user_id", 1), ("product_id", 1)],
        ]
