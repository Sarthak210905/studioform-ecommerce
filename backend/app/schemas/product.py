from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class ProductVariantSchema(BaseModel):
    sku: str
    name: str
    attributes: Dict[str, str]
    price_adjustment: float = 0.0
    stock: int = 0
    image_url: Optional[str] = None

class CreateProduct(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    category: Optional[str] = None
    brand: Optional[str] = None
    images: List[str] = []
    stock: int = Field(default=0, ge=0)
    
    # Variants
    has_variants: bool = False
    variants: List[ProductVariantSchema] = []
    
    # Related products
    related_product_ids: List[str] = []
    
    # Discount
    discount_percentage: float = Field(default=0, ge=0, le=100)
    discount_amount: float = Field(default=0, ge=0)
    sale_price: Optional[float] = None
    discount_active: bool = False
    discount_starts_at: Optional[datetime] = None
    discount_ends_at: Optional[datetime] = None
    
    # Metadata
    is_featured: bool = False
    tags: List[str] = []
    
    # SEO
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    slug: Optional[str] = None

class UpdateProduct(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    brand: Optional[str] = None
    images: Optional[List[str]] = None
    stock: Optional[int] = Field(None, ge=0)
    
    # Variants
    has_variants: Optional[bool] = None
    variants: Optional[List[ProductVariantSchema]] = None
    
    # Related products
    related_product_ids: Optional[List[str]] = None
    
    # Discount
    discount_percentage: Optional[float] = Field(None, ge=0, le=100)
    discount_amount: Optional[float] = Field(None, ge=0)
    sale_price: Optional[float] = None
    discount_active: Optional[bool] = None
    discount_starts_at: Optional[datetime] = None
    discount_ends_at: Optional[datetime] = None
    
    # Metadata
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    tags: Optional[List[str]] = None
    
    # SEO
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    slug: Optional[str] = None

class ProductResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    price: float
    final_price: float
    savings: float
    savings_percentage: float
    category: Optional[str]
    brand: Optional[str]
    images: List[str]
    main_image: Optional[str]
    stock: int
    total_stock: int
    is_in_stock: bool
    
    # Variants
    has_variants: bool
    variants: List[ProductVariantSchema]
    
    # Related products
    related_product_ids: List[str]
    
    # Discount
    discount_active: bool
    discount_percentage: float
    discount_amount: float
    discount_starts_at: Optional[datetime]
    discount_ends_at: Optional[datetime]
    
    # Metadata
    is_active: bool
    is_featured: bool
    tags: List[str]
    
    # Stats
    views_count: int
    sales_count: int
    
    # SEO
    slug: Optional[str]
    
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
