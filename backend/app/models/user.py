from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field, EmailStr

class User(Document):
    email: EmailStr
    username: str
    full_name: str
    hashed_password: str
    
    # Status flags
    is_active: bool = True
    is_verified: bool = False
    is_superuser: bool = False
    
    # Authentication
    auth_provider: str = "email"  # "email", "google", "facebook"
    
    # Email verification
    verification_token: Optional[str] = None
    verification_token_expires: Optional[datetime] = None
    
    # Password reset
    reset_token: Optional[str] = None
    reset_token_expires: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None
    
    class Settings:
        name = "users"
        indexes = [
            "email",
            "username",
        ]
