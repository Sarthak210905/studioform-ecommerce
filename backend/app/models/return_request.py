from datetime import datetime, timezone
from beanie import Document
from pydantic import Field
from typing import Optional, List

class ReturnRequest(Document):
    user_id: str
    order_id: str
    order_number: str
    request_type: str  # "return" or "exchange"
    reason: str
    items: List[dict]  # [{"product_id": "xxx", "quantity": 2, "reason": "damaged"}]
    status: str = "pending"  # pending, approved, rejected, completed
    
    # Optional fields
    images: List[str] = []  # Proof images
    admin_notes: Optional[str] = None
    refund_amount: Optional[float] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Settings:
        name = "return_requests"
        indexes = [
            [("user_id", 1), ("created_at", -1)],
            "order_id",
            "status",
        ]
