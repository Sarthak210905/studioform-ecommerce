from pydantic import BaseModel
from typing import Optional
from app.schemas.user import UserResponse

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[UserResponse] = None  # NEW: Include user info in login response
