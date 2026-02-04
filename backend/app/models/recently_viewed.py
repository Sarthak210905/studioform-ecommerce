from datetime import datetime
from beanie import Document
from pydantic import Field

class RecentlyViewed(Document):
    user_id: str
    product_id: str
    viewed_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "recently_viewed"
        indexes = [
            [("user_id", 1), ("viewed_at", -1)],
            [("user_id", 1), ("product_id", 1)],
        ]
