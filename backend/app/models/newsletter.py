from beanie import Document
from datetime import datetime
from typing import Optional


class NewsletterSubscriber(Document):
    email: str
    subscribed_at: datetime = datetime.utcnow()
    is_active: bool = True
    
    class Settings:
        name = "newsletter_subscribers"
