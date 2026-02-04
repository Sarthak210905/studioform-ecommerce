from beanie import Document
from typing import Optional
from datetime import datetime


class HeroBanner(Document):
    """Hero banner for homepage sections"""
    name: str
    image_url: str
    title: str
    description: str
    position: int  # 1=main hero, 2=pivot banner, 3=gifting banner
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    is_active: bool = True
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

    class Settings:
        collection = "hero_banners"
