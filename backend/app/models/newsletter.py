from beanie import Document
from datetime import datetime, timezone
from pydantic import Field
from typing import Optional


class NewsletterSubscriber(Document):
    email: str
    subscribed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    
    class Settings:
        name = "newsletter_subscribers"
