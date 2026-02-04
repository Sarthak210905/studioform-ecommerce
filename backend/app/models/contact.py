from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import EmailStr


class ContactSubmission(Document):
    name: str
    email: EmailStr
    subject: str
    message: str
    status: str = "new"  # new, read, responded, archived
    admin_notes: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    
    class Settings:
        name = "contact_submissions"
        indexes = [
            "email",
            "status",
            [("created_at", -1)]  # Sort by newest first
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "subject": "Product inquiry",
                "message": "I have a question about your products...",
                "status": "new"
            }
        }
