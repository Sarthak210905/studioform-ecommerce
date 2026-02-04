from datetime import datetime, timedelta
from typing import Optional
from beanie import Document
from pydantic import Field

class OTP(Document):
    email: str = Field(..., index=True)
    otp_code: str
    purpose: str  # "password_reset", "email_verification", etc.
    is_used: bool = False
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "otps"
        indexes = [
            "email",
            "otp_code",
        ]
    
    def is_valid(self) -> bool:
        """Check if OTP is still valid"""
        return not self.is_used and datetime.utcnow() < self.expires_at
