from typing import List, Optional, Dict
from datetime import datetime
from beanie import Document, Indexed
from pydantic import BaseModel, Field

# Product Variant Model
class ProductVariant(BaseModel):
    """Product variant (e.g., different colors, sizes)"""
    sku: str
    name: str  # e.g., "Red - Large", "Blue - Medium"
    attributes: Dict[str, str]  # {"color": "Red", "size": "Large"}
    price_adjustment: float = 0.0  # Additional price for this variant
    stock: int = 0
    image_url: Optional[str] = None

class Product(Document):
    # Basic fields - Use Indexed() ONLY for str fields
    name: Indexed(str)  # Text index for search
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    category: Optional[str] = None
    brand: Optional[str] = None
    images: List[str] = []
    stock: int = Field(default=0, ge=0)
    
    # Product Variants
    has_variants: bool = False
    variants: List[ProductVariant] = []
    
    # Related Products
    related_product_ids: List[str] = []
    
    # Discount fields
    discount_percentage: float = Field(default=0, ge=0, le=100)
    discount_amount: float = Field(default=0, ge=0)
    sale_price: Optional[float] = None
    discount_active: bool = False
    discount_starts_at: Optional[datetime] = None
    discount_ends_at: Optional[datetime] = None
    
    # Metadata
    is_active: bool = True  # Don't use Indexed() with bool
    is_featured: bool = False
    tags: List[str] = []
    
    # SEO
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    slug: Optional[str] = None
    
    # Stats
    views_count: int = 0
    sales_count: int = 0
    rating: float = 0.0
    reviews_count: int = 0
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "products"
        # Define ALL indexes here
        indexes = [
            # Text search index
            [
                ("name", "text"),
                ("description", "text"),
            ],
            # Single field indexes
            "category",
            "brand",
            "is_active",
            "is_featured",
            "created_at",
            "slug",
            # Compound indexes for common queries
            [
                ("category", 1),
                ("is_active", 1),
            ],
            [
                ("is_active", 1),
                ("price", 1),
            ],
            [
                ("is_featured", 1),
                ("created_at", -1),
            ],
            [
                ("stock", 1),
                ("is_active", 1),
            ],
            [
                ("sales_count", -1),
            ],
        ]
    
    @property
    def main_image(self) -> Optional[str]:
        """Get first image as main image"""
        return self.images[0] if self.images else None
    
    @property
    def final_price(self) -> float:
        """Calculate final price after discount"""
        if not self.discount_active:
            return self.price

        now = datetime.utcnow()
        if self.discount_starts_at and now < self.discount_starts_at:
            return self.price
        if self.discount_ends_at and now > self.discount_ends_at:
            return self.price

        candidates = [self.price]

        # Use sale_price if provided
        if self.sale_price is not None and self.sale_price > 0:
            candidates.append(self.sale_price)

        # Percentage-based discount
        if self.discount_percentage > 0:
            pct_price = self.price * (1 - self.discount_percentage / 100)
            candidates.append(max(pct_price, 0))

        # Flat discount amount
        if self.discount_amount > 0:
            amt_price = self.price - self.discount_amount
            candidates.append(max(amt_price, 0))

        return round(min(candidates), 2)
    
    @property
    def savings(self) -> float:
        """Calculate savings amount"""
        return round(self.price - self.final_price, 2)
    
    @property
    def savings_percentage(self) -> float:
        """Calculate savings percentage"""
        if self.price == 0:
            return 0
        return round((self.savings / self.price) * 100, 2)
    
    @property
    def is_in_stock(self) -> bool:
        """Check if product is in stock"""
        if self.has_variants:
            return any(variant.stock > 0 for variant in self.variants)
        return self.stock > 0
    
    @property
    def total_stock(self) -> int:
        """Get total stock (including variants)"""
        if self.has_variants:
            return sum(variant.stock for variant in self.variants)
        return self.stock
    
    def get_variant_by_attributes(self, attributes: Dict[str, str]) -> Optional[ProductVariant]:
        """Find variant by attributes"""
        for variant in self.variants:
            if variant.attributes == attributes:
                return variant
        return None
    
    def get_variant_price(self, variant_sku: str) -> float:
        """Get final price for a specific variant"""
        for variant in self.variants:
            if variant.sku == variant_sku:
                return round(self.final_price + variant.price_adjustment, 2)
        return self.final_price
    
    async def increment_views(self):
        """Increment product views"""
        self.views_count += 1
        self.updated_at = datetime.utcnow()
        await self.save()
    
    async def increment_sales(self, quantity: int = 1):
        """Increment sales count"""
        self.sales_count += quantity
        self.updated_at = datetime.utcnow()
        await self.save()
