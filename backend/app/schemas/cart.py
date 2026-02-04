from pydantic import BaseModel, Field
from typing import Optional

class AddToCart(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1, le=100)

class UpdateCartItem(BaseModel):
    quantity: int = Field(..., ge=0, le=100)

class CartItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    product_price: float
    quantity: int
    image_url: Optional[str] = None
    subtotal: float
    
    class Config:
        from_attributes = True

class CartSummary(BaseModel):
    items: list[CartItemResponse]
    total_items: int
    total_price: float
