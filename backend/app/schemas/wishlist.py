from pydantic import BaseModel
from datetime import datetime

class AddToWishlist(BaseModel):
    product_id: str

class WishlistItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    product_price: float
    final_price: float
    discount_percentage: float
    image_url: str
    in_stock: bool
    added_at: datetime
