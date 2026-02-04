from typing import List
from fastapi import APIRouter, Depends
from app.models.product import Product
from app.models.review import Review
from app.schemas.product import ProductResponse
from app.schemas.search import ProductSearch

router = APIRouter()

@router.post("/", response_model=List[ProductResponse])
async def search_products(search_params: ProductSearch):
    """Advanced product search with filters"""
    
    # Build query
    query_conditions = []
    
    # Text search
    if search_params.query:
        # Search in name, description, category
        query_conditions.append({
            "$or": [
                {"name": {"$regex": search_params.query, "$options": "i"}},
                {"description": {"$regex": search_params.query, "$options": "i"}},
                {"category": {"$regex": search_params.query, "$options": "i"}}
            ]
        })
    
    # Category filter
    if search_params.category:
        query_conditions.append({"category": search_params.category})
    
    # Price range
    if search_params.min_price is not None:
        query_conditions.append({"price": {"$gte": search_params.min_price}})
    if search_params.max_price is not None:
        query_conditions.append({"price": {"$lte": search_params.max_price}})
    
    # Stock filter
    if search_params.in_stock_only:
        query_conditions.append({"stock": {"$gt": 0}})
    
    # On sale filter
    if search_params.on_sale_only:
        query_conditions.append({"discount_active": True})
    
    # Build final query
    if query_conditions:
        final_query = {"$and": query_conditions}
    else:
        final_query = {}
    
    # Execute query
    products = await Product.find(final_query).to_list()
    
    # Filter by rating if needed
    if search_params.min_rating is not None:
        filtered_products = []
        for product in products:
            reviews = await Review.find(Review.product_id == str(product.id)).to_list()
            if reviews:
                avg_rating = sum(r.rating for r in reviews) / len(reviews)
                if avg_rating >= search_params.min_rating:
                    filtered_products.append(product)
            elif search_params.min_rating == 0:
                filtered_products.append(product)
        products = filtered_products
    
    # Sort products
    if search_params.sort_by == "price_low":
        products.sort(key=lambda p: p.final_price)
    elif search_params.sort_by == "price_high":
        products.sort(key=lambda p: p.final_price, reverse=True)
    elif search_params.sort_by == "newest":
        products.sort(key=lambda p: p.created_at, reverse=True)
    elif search_params.sort_by == "rating":
        # Sort by rating (requires calculating for each)
        async def get_product_rating(product):
            reviews = await Review.find(Review.product_id == str(product.id)).to_list()
            if reviews:
                return sum(r.rating for r in reviews) / len(reviews)
            return 0
        
        # This is inefficient for large datasets - consider caching ratings
        products_with_ratings = []
        for product in products:
            rating = await get_product_rating(product)
            products_with_ratings.append((product, rating))
        products_with_ratings.sort(key=lambda x: x[1], reverse=True)
        products = [p[0] for p in products_with_ratings]
    
    # Pagination
    start = (search_params.page - 1) * search_params.limit
    end = start + search_params.limit
    products = products[start:end]
    
    # Convert to response
    return [
        ProductResponse(
            id=str(product.id),
            name=product.name,
            description=product.description,
            price=product.price,
            final_price=product.final_price,
            discount_percentage=product.savings_percentage,
            savings=product.savings,
            discount_active=product.discount_active,
            category=product.category,
            image_url=product.image_url,
            stock=product.stock
        )
        for product in products
    ]

@router.get("/categories")
async def get_categories():
    """Get all unique product categories"""
    
    products = await Product.find_all().to_list()
    categories = list(set(p.category for p in products if p.category))
    
    return {"categories": sorted(categories)}
