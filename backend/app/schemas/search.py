from pydantic import BaseModel, Field
from typing import Optional

class ProductSearch(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = Field(None, ge=0)
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    in_stock_only: bool = False
    on_sale_only: bool = False
    sort_by: Optional[str] = Field(None, pattern="^(price_low|price_high|rating|newest|popular)$")
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
