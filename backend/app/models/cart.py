from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import Field

class CartItem(Document):
    user_id: str = Field(..., index=True)
    product_id: str
    product_name: str
    product_price: float
    quantity: int = Field(default=1, ge=1)
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "cart_items"
    
    @property
    def subtotal(self) -> float:
        """Calculate subtotal for this cart item"""
        return self.product_price * self.quantity
