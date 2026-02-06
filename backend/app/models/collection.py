from typing import Optional, List
from datetime import datetime, timezone
from beanie import Document, Indexed
from pydantic import Field


class Collection(Document):
    """Special Edition Collection model"""
    name: Indexed(str, unique=True)  # e.g., "Harry Potter Edition"
    slug: Indexed(str, unique=True)  # e.g., "harry-potter-edition"
    title: str  # Display title e.g., "Harry Potter"
    subtitle: str = ""
    description: str = ""
    banner_image: Optional[str] = None  # Cloudinary URL for collection banner
    icon_name: str = "Sparkles"  # Lucide icon name
    gradient: str = "from-purple-950 via-indigo-900 to-slate-900"
    accent_color: str = "bg-purple-500"
    bg_pattern: str = "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]"
    is_active: bool = True
    position: int = 0
    product_count: int = 0  # Cached count
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "collections"
        indexes = [
            "slug",
            "is_active",
            [("position", 1)],
            [("is_active", 1), ("position", 1)],
        ]
