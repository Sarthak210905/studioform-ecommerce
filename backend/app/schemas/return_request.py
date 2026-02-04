from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ReturnRequestItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    reason: str

class CreateReturnRequest(BaseModel):
    order_id: str
    request_type: str  # "return" or "exchange"
    reason: str
    items: List[ReturnRequestItem]

class UpdateReturnStatus(BaseModel):
    status: str  # approved, rejected, completed
    admin_notes: Optional[str] = None
    refund_amount: Optional[float] = None

class ReturnRequestResponse(BaseModel):
    id: str
    user_id: str
    order_id: str
    order_number: str
    request_type: str
    reason: str
    items: List[ReturnRequestItem]
    status: str
    images: List[str]
    admin_notes: Optional[str]
    refund_amount: Optional[float]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
