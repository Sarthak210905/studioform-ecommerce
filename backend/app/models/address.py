from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import Field

class Address(Document):
    user_id: str = Field(..., index=True)
    label: str  # "Home", "Office", etc.
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    country: str = "India"
    is_default: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "addresses"
