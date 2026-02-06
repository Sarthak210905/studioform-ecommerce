from datetime import datetime, timedelta, timezone
from typing import Optional
from beanie import Document
from pydantic import Field

class OTP(Document):
    email: str = Field(..., index=True)
    otp_code: str
    purpose: str  # "password_reset", "email_verification", etc.
    is_used: bool = False
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Settings:
        name = "otps"
        indexes = [
            "email",
            "otp_code",
        ]
    
    def is_valid(self) -> bool:
        """Check if OTP is still valid"""
        return not self.is_used and datetime.now(timezone.utc) < self.expires_at
