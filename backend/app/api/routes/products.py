from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from beanie import PydanticObjectId
from datetime import datetime
import csv
import io
from fastapi.responses import StreamingResponse

from app.models.product import Product, ProductVariant
from app.models.user import User
from app.models.tracking import RecentlyViewed
from app.schemas.product import ProductResponse
from app.services.auth import get_current_active_user
from app.services.cloudinary import upload_image
from app.services.cache import cache_get, cache_set, cache_clear_pattern

router = APIRouter()

# ==================== PUBLIC ROUTES ====================

@router.get("/trending", response_model=List[ProductResponse])
async def get_trending_products(limit: int = 100):
    """Get trending products (bestsellers)"""
    products = await Product.find(
        Product.is_active == True
    ).sort([("sales_count", -1)]).limit(limit).to_list()
    
    return [ProductResponse(**product.dict()) for product in products]

@router.get("/", response_model=dict)
async def get_products(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = "created_at",  # created_at, price, name, sales_count
    sort_order: Optional[str] = "desc"  # asc, desc
):
    """Get all products with filters, search, and caching"""
    
    # Create cache key
    cache_key = f"products:{skip}:{limit}:{category}:{brand}:{search}:{min_price}:{max_price}:{sort_by}:{sort_order}"
    
    # Try to get from cache
    cached_data = cache_get(cache_key)
    if cached_data:
        return cached_data
    
    # Build query
    query = Product.find(Product.is_active == True)
    
    # Filters
    if category:
        query = query.find(Product.category == category)
    if brand:
        query = query.find(Product.brand == brand)
    if search:
        query = query.find({"$text": {"$search": search}})
    if min_price is not None:
        query = query.find(Product.price >= min_price)
    if max_price is not None:
        query = query.find(Product.price <= max_price)
    
    # Sorting
    sort_field = getattr(Product, sort_by, Product.created_at)
    if sort_order == "asc":
        query = query.sort(+sort_field)
    else:
        query = query.sort(-sort_field)
    
    # Pagination
    products = await query.skip(skip).limit(limit).to_list()
    total = await query.count()
    
    result = {
        "products": [
            ProductResponse(
                id=str(product.id),
                name=product.name,
                description=product.description,
                price=product.price,
                final_price=product.final_price,
                savings=product.savings,
                savings_percentage=product.savings_percentage,
                discount_active=product.discount_active,
                discount_percentage=product.discount_percentage,
                discount_amount=product.discount_amount,
                discount_starts_at=product.discount_starts_at,
                discount_ends_at=product.discount_ends_at,
                category=product.category,
                brand=product.brand,
                images=product.images,
                main_image=product.main_image,
                stock=product.stock,
                total_stock=product.total_stock,
                is_in_stock=product.is_in_stock,
                has_variants=product.has_variants,
                variants=product.variants,
                related_product_ids=product.related_product_ids,
                is_active=product.is_active,
                is_featured=product.is_featured,
                tags=product.tags,
                views_count=product.views_count,
                sales_count=product.sales_count,
                slug=product.slug,
                created_at=product.created_at,
                updated_at=product.updated_at
            ).dict()
            for product in products
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": total > skip + limit
    }
    
    # Cache for 5 minutes
    cache_set(cache_key, result, expire=300)
    
    return result

@router.get("/featured", response_model=List[ProductResponse])
async def get_featured_products(limit: int = 8):
    """Get featured products"""
    
    products = await Product.find(
        Product.is_active == True,
        Product.is_featured == True
    ).limit(limit).to_list()
    
    return [
        ProductResponse(
            id=str(product.id),
            name=product.name,
            description=product.description,
            price=product.price,
            final_price=product.final_price,
            savings=product.savings,
            savings_percentage=product.savings_percentage,
            discount_active=product.discount_active,
            discount_percentage=product.discount_percentage,
            discount_amount=product.discount_amount,
            discount_starts_at=product.discount_starts_at,
            discount_ends_at=product.discount_ends_at,
            category=product.category,
            brand=product.brand,
            images=product.images,
            main_image=product.main_image,
            stock=product.stock,
            total_stock=product.total_stock,
            is_in_stock=product.is_in_stock,
            has_variants=product.has_variants,
            variants=product.variants,
            related_product_ids=product.related_product_ids,
            is_active=product.is_active,
            is_featured=product.is_featured,
            tags=product.tags,
            views_count=product.views_count,
            sales_count=product.sales_count,
            slug=product.slug,
            created_at=product.created_at,
            updated_at=product.updated_at
        )
        for product in products
    ]

@router.get("/categories")
async def get_categories():
    """Get all product categories"""
    
    collection = Product.get_motor_collection()
    categories = await collection.distinct("category", {"is_active": True, "category": {"$ne": None}})
    
    return {"categories": sorted(categories)}

@router.get("/brands")
async def get_brands():
    """Get all product brands"""
    
    collection = Product.get_motor_collection()
    brands = await collection.distinct("brand", {"is_active": True, "brand": {"$ne": None}})
    
    return {"brands": sorted(brands)}

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """Get single product by ID"""
    
    try:
        product = await Product.get(PydanticObjectId(product_id))
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Increment views
        await product.increment_views()
        
        return ProductResponse(
            id=str(product.id),
            name=product.name,
            description=product.description,
            price=product.price,
            final_price=product.final_price,
            savings=product.savings,
            savings_percentage=product.savings_percentage,
            discount_active=product.discount_active,
            discount_percentage=product.discount_percentage,
            discount_amount=product.discount_amount,
            discount_starts_at=product.discount_starts_at,
            discount_ends_at=product.discount_ends_at,
            category=product.category,
            brand=product.brand,
            images=product.images,
            main_image=product.main_image,
            stock=product.stock,
            total_stock=product.total_stock,
            is_in_stock=product.is_in_stock,
            has_variants=product.has_variants,
            variants=product.variants,
            related_product_ids=product.related_product_ids,
            is_active=product.is_active,
            is_featured=product.is_featured,
            tags=product.tags,
            views_count=product.views_count,
            sales_count=product.sales_count,
            slug=product.slug,
            created_at=product.created_at,
            updated_at=product.updated_at
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

@router.get("/{product_id}/related")
async def get_related_products(product_id: str, limit: int = 6):
    """Get related products"""
    
    try:
        product = await Product.get(PydanticObjectId(product_id))
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    # Get manually set related products
    related_products = []
    for related_id in product.related_product_ids:
        try:
            related = await Product.get(PydanticObjectId(related_id))
            if related and related.is_active:
                related_products.append(related)
        except Exception:
            continue
    
    # If no manual related products, find by category
    if not related_products:
        related_products = await Product.find(
            Product.category == product.category,
            Product.id != product.id,
            Product.is_active == True
        ).limit(limit).to_list()
    
    return {
        "related_products": [
            ProductResponse(
                id=str(p.id),
                name=p.name,
                description=p.description,
                price=p.price,
                final_price=p.final_price,
                savings=p.savings,
                savings_percentage=p.savings_percentage,
                discount_active=p.discount_active,
                discount_percentage=p.discount_percentage,
                discount_amount=p.discount_amount,
                discount_starts_at=p.discount_starts_at,
                discount_ends_at=p.discount_ends_at,
                category=p.category,
                brand=p.brand,
                images=p.images,
                main_image=p.main_image,
                stock=p.stock,
                total_stock=p.total_stock,
                is_in_stock=p.is_in_stock,
                has_variants=p.has_variants,
                variants=p.variants,
                related_product_ids=p.related_product_ids,
                is_active=p.is_active,
                is_featured=p.is_featured,
                tags=p.tags,
                views_count=p.views_count,
                sales_count=p.sales_count,
                slug=p.slug,
                created_at=p.created_at,
                updated_at=p.updated_at
            ).dict()
            for p in related_products
        ]
    }

# ==================== PROTECTED ROUTES (USER) ====================

@router.post("/{product_id}/view")
async def track_product_view(
    product_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Track product view for recommendations"""
    
    # Delete old view if exists
    await RecentlyViewed.find(
        RecentlyViewed.user_id == str(current_user.id),
        RecentlyViewed.product_id == product_id
    ).delete()
    
    # Add new view
    view = RecentlyViewed(
        user_id=str(current_user.id),
        product_id=product_id
    )
    await view.insert()
    
    # Keep only last 20 views
    views = await RecentlyViewed.find(
        RecentlyViewed.user_id == str(current_user.id)
    ).sort(-RecentlyViewed.viewed_at).to_list()
    
    if len(views) > 20:
        for old_view in views[20:]:
            await old_view.delete()
    
    return {"success": True}

@router.get("/recently-viewed/me")
async def get_recently_viewed(
    current_user: User = Depends(get_current_active_user),
    limit: int = 10
):
    """Get user's recently viewed products"""
    
    views = await RecentlyViewed.find(
        RecentlyViewed.user_id == str(current_user.id)
    ).sort(-RecentlyViewed.viewed_at).limit(limit).to_list()
    
    products = []
    for view in views:
        try:
            product = await Product.get(PydanticObjectId(view.product_id))
            if product and product.is_active:
                products.append(
                    ProductResponse(
                        id=str(product.id),
                        name=product.name,
                        description=product.description,
                        price=product.price,
                        final_price=product.final_price,
                        savings=product.savings,
                        savings_percentage=product.savings_percentage,
                        discount_active=product.discount_active,
                        discount_percentage=product.discount_percentage,
                        discount_amount=product.discount_amount,
                        discount_starts_at=product.discount_starts_at,
                        discount_ends_at=product.discount_ends_at,
                        category=product.category,
                        brand=product.brand,
                        images=product.images,
                        main_image=product.main_image,
                        stock=product.stock,
                        total_stock=product.total_stock,
                        is_in_stock=product.is_in_stock,
                        has_variants=product.has_variants,
                        variants=product.variants,
                        related_product_ids=product.related_product_ids,
                        is_active=product.is_active,
                        is_featured=product.is_featured,
                        tags=product.tags,
                        views_count=product.views_count,
                        sales_count=product.sales_count,
                        slug=product.slug,
                        created_at=product.created_at,
                        updated_at=product.updated_at
                    ).dict()
                )
        except Exception:
            continue
    
    return {"recently_viewed": products}

# ==================== ADMIN ROUTES ====================

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    name: str = Form(...),
    price: float = Form(..., gt=0),
    stock: int = Form(default=0, ge=0),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    brand: Optional[str] = Form(None),
    discount_percentage: Optional[float] = Form(None),
    discount_amount: Optional[float] = Form(None),
    sale_price: Optional[float] = Form(None),
    discount_active: bool = Form(False),
    discount_starts_at: Optional[str] = Form(None),
    discount_ends_at: Optional[str] = Form(None),
    is_featured: bool = Form(False),
    is_active: bool = Form(True),
    tags: Optional[str] = Form(None),
    images: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Create product with multiple images"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    if not images or len(images) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one image is required"
        )
    
    if len(images) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 images allowed"
        )
    
    # Upload images
    uploaded_image_urls = []
    for idx, image in enumerate(images):
        if not image.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {image.filename} must be an image"
            )
        
        file_content = await image.read()
        image_url = await upload_image(
            file_content,
            filename=f"{name.replace(' ', '_')}_{idx}_{image.filename}",
            folder="premium-accessories/products"
        )
        
        if not image_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload image {image.filename}"
            )
        
        uploaded_image_urls.append(image_url)
    
    # Parse tags
    tag_list = []
    if tags:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]

    # Parse discount window
    starts_at_dt = datetime.fromisoformat(discount_starts_at) if discount_starts_at else None
    ends_at_dt = datetime.fromisoformat(discount_ends_at) if discount_ends_at else None

    # Create product with discount/meta fields
    product = Product(
        name=name,
        description=description,
        price=price,
        category=category,
        brand=brand,
        images=uploaded_image_urls,
        stock=stock,
        discount_percentage=discount_percentage or 0,
        discount_amount=discount_amount or 0,
        sale_price=sale_price,
        discount_active=discount_active,
        discount_starts_at=starts_at_dt,
        discount_ends_at=ends_at_dt,
        is_featured=is_featured,
        is_active=is_active,
        tags=tag_list,
    )
    await product.insert()
    
    # Clear cache
    cache_clear_pattern("products:*")
    
    return ProductResponse(
        id=str(product.id),
        name=product.name,
        description=product.description,
        price=product.price,
        final_price=product.final_price,
        savings=product.savings,
        savings_percentage=product.savings_percentage,
        discount_active=product.discount_active,
        discount_percentage=product.discount_percentage,
        discount_amount=product.discount_amount,
        discount_starts_at=product.discount_starts_at,
        discount_ends_at=product.discount_ends_at,
        category=product.category,
        brand=product.brand,
        images=product.images,
        main_image=product.main_image,
        stock=product.stock,
        total_stock=product.total_stock,
        is_in_stock=product.is_in_stock,
        has_variants=product.has_variants,
        variants=product.variants,
        related_product_ids=product.related_product_ids,
        is_active=product.is_active,
        is_featured=product.is_featured,
        tags=product.tags,
        views_count=product.views_count,
        sales_count=product.sales_count,
        slug=product.slug,
        created_at=product.created_at,
        updated_at=product.updated_at
    )

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    name: Optional[str] = Form(None),
    price: Optional[float] = Form(None, gt=0),
    stock: Optional[int] = Form(None, ge=0),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    brand: Optional[str] = Form(None),
    is_featured: Optional[bool] = Form(None),
    is_active: Optional[bool] = Form(None),
    tags: Optional[str] = Form(None),
    discount_percentage: Optional[float] = Form(None),
    discount_amount: Optional[float] = Form(None),
    sale_price: Optional[float] = Form(None),
    discount_active: Optional[bool] = Form(None),
    discount_starts_at: Optional[str] = Form(None),
    discount_ends_at: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Update product (without images)"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        product = await Product.get(PydanticObjectId(product_id))
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        if name:
            product.name = name
        if description is not None:
            product.description = description
        if price:
            product.price = price
        if category is not None:
            product.category = category
        if brand is not None:
            product.brand = brand
        if stock is not None:
            product.stock = stock
        if is_featured is not None:
            product.is_featured = is_featured
        if is_active is not None:
            product.is_active = is_active
        if tags is not None:
            product.tags = [t.strip() for t in tags.split(",") if t.strip()]
        if discount_percentage is not None:
            product.discount_percentage = discount_percentage
        if discount_amount is not None:
            product.discount_amount = discount_amount
        if sale_price is not None:
            product.sale_price = sale_price
        if discount_active is not None:
            product.discount_active = discount_active
        if discount_starts_at is not None:
            product.discount_starts_at = datetime.fromisoformat(discount_starts_at)
        if discount_ends_at is not None:
            product.discount_ends_at = datetime.fromisoformat(discount_ends_at)
        
        product.updated_at = datetime.utcnow()
        await product.save()
        
        # Clear cache
        cache_clear_pattern("products:*")
        
        return ProductResponse(
            id=str(product.id),
            name=product.name,
            description=product.description,
            price=product.price,
            final_price=product.final_price,
            savings=product.savings,
            savings_percentage=product.savings_percentage,
            discount_active=product.discount_active,
            discount_percentage=product.discount_percentage,
            discount_amount=product.discount_amount,
            discount_starts_at=product.discount_starts_at,
            discount_ends_at=product.discount_ends_at,
            category=product.category,
            brand=product.brand,
            images=product.images,
            main_image=product.main_image,
            stock=product.stock,
            total_stock=product.total_stock,
            is_in_stock=product.is_in_stock,
            has_variants=product.has_variants,
            variants=product.variants,
            related_product_ids=product.related_product_ids,
            is_active=product.is_active,
            is_featured=product.is_featured,
            tags=product.tags,
            views_count=product.views_count,
            sales_count=product.sales_count,
            slug=product.slug,
            created_at=product.created_at,
            updated_at=product.updated_at
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

@router.post("/{product_id}/images", response_model=ProductResponse)
async def add_product_images(
    product_id: str,
    images: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Add more images to existing product"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        product = await Product.get(PydanticObjectId(product_id))
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    if len(product.images) + len(images) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot add {len(images)} images. Max 10. Current: {len(product.images)}"
        )
    
    uploaded_image_urls = []
    for idx, image in enumerate(images):
        if not image.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {image.filename} must be an image"
            )
        
        file_content = await image.read()
        image_url = await upload_image(
            file_content,
            filename=f"{product.name.replace(' ', '_')}_{len(product.images) + idx}_{image.filename}",
            folder="premium-accessories/products"
        )
        
        if image_url:
            uploaded_image_urls.append(image_url)
    
    product.images.extend(uploaded_image_urls)
    product.updated_at = datetime.utcnow()
    await product.save()
    
    # Clear cache
    cache_clear_pattern("products:*")
    
    return ProductResponse(
        id=str(product.id),
        name=product.name,
        description=product.description,
        price=product.price,
        final_price=product.final_price,
        savings=product.savings,
        savings_percentage=product.savings_percentage,
        discount_active=product.discount_active,
        discount_percentage=product.discount_percentage,
        discount_amount=product.discount_amount,
        discount_starts_at=product.discount_starts_at,
        discount_ends_at=product.discount_ends_at,
        category=product.category,
        brand=product.brand,
        images=product.images,
        main_image=product.main_image,
        stock=product.stock,
        total_stock=product.total_stock,
        is_in_stock=product.is_in_stock,
        has_variants=product.has_variants,
        variants=product.variants,
        related_product_ids=product.related_product_ids,
        is_active=product.is_active,
        is_featured=product.is_featured,
        tags=product.tags,
        views_count=product.views_count,
        sales_count=product.sales_count,
        slug=product.slug,
        created_at=product.created_at,
        updated_at=product.updated_at
    )

@router.delete("/{product_id}/images/{image_index}")
async def delete_product_image(
    product_id: str,
    image_index: int,
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Delete specific image by index"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        product = await Product.get(PydanticObjectId(product_id))
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    if image_index < 0 or image_index >= len(product.images):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image index. Product has {len(product.images)} images"
        )
    
    if len(product.images) == 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete the last image"
        )
    
    product.images.pop(image_index)
    product.updated_at = datetime.utcnow()
    await product.save()
    
    # Clear cache
    cache_clear_pattern("products:*")
    
    return {"success": True, "message": "Image deleted"}

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Delete product"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        product = await Product.get(PydanticObjectId(product_id))
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        await product.delete()
        
        # Clear cache
        cache_clear_pattern("products:*")
        
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

# ==================== VARIANTS ====================

@router.post("/{product_id}/variants")
async def add_product_variant(
    product_id: str,
    variant: ProductVariant,
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Add variant to product"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        product = await Product.get(PydanticObjectId(product_id))
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    product.has_variants = True
    product.variants.append(variant)
    product.updated_at = datetime.utcnow()
    await product.save()
    
    # Clear cache
    cache_clear_pattern("products:*")
    
    return {"success": True, "message": "Variant added", "variants": product.variants}

@router.post("/{product_id}/related/{related_product_id}")
async def add_related_product(
    product_id: str,
    related_product_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Add related product"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    product = await Product.get(PydanticObjectId(product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if related_product_id not in product.related_product_ids:
        product.related_product_ids.append(related_product_id)
        product.updated_at = datetime.utcnow()
        await product.save()
    
    return {"success": True, "message": "Related product added"}

# ==================== BULK OPERATIONS ====================

@router.post("/bulk-upload")
async def bulk_upload_products(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Bulk upload products via CSV"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files allowed"
        )
    
    content = await file.read()
    csv_content = content.decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(csv_content))
    
    created_count = 0
    errors = []
    
    for row in csv_reader:
        try:
            product = Product(
                name=row['name'],
                description=row.get('description', ''),
                price=float(row['price']),
                category=row.get('category', ''),
                brand=row.get('brand', ''),
                stock=int(row.get('stock', 0)),
                images=[]
            )
            await product.insert()
            created_count += 1
        except Exception as e:
            errors.append(f"Row {csv_reader.line_num}: {str(e)}")
    
    # Clear cache
    cache_clear_pattern("products:*")
    
    return {
        "success": True,
        "created": created_count,
        "errors": errors
    }

@router.get("/export")
async def export_products(current_user: User = Depends(get_current_active_user)):
    """Admin: Export all products to CSV"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    products = await Product.find_all().to_list()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        'id', 'name', 'description', 'price', 'final_price', 
        'category', 'brand', 'stock', 'discount_active', 'sales_count'
    ])
    
    # Data
    for product in products:
        writer.writerow([
            str(product.id),
            product.name,
            product.description or '',
            product.price,
            product.final_price,
            product.category or '',
            product.brand or '',
            product.stock,
            product.discount_active,
            product.sales_count
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products.csv"}
    )

@router.put("/bulk-update-stock")
async def bulk_update_stock(
    updates: List[dict],
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Bulk update product stock"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    updated_count = 0
    errors = []
    
    for update in updates:
        try:
            product = await Product.get(PydanticObjectId(update['product_id']))
            if product:
                product.stock = update['stock']
                product.updated_at = datetime.utcnow()
                await product.save()
                updated_count += 1
            else:
                errors.append(f"Product {update['product_id']} not found")
        except Exception as e:
            errors.append(f"Error: {update['product_id']}: {str(e)}")
    
    # Clear cache
    cache_clear_pattern("products:*")
    
    return {
        "success": True,
        "updated": updated_count,
        "errors": errors
    }
