from datetime import datetime
from beanie import Document
from pydantic import Field
from typing import Optional

class Notification(Document):
    user_id: str
    type: str  # "order_update", "stock_alert", "price_drop", "promotion"
    title: str
    message: str
    link: Optional[str] = None  # Link to order/product
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "notifications"
        indexes = [
            [("user_id", 1), ("created_at", -1)],
            [("user_id", 1), ("is_read", 1)],
        ]
