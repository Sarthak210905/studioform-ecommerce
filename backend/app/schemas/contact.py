from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ContactSubmissionCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


class ContactSubmissionResponse(BaseModel):
    id: str
    name: str
    email: str
    subject: str
    message: str
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ContactSubmissionUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None
