from fastapi import APIRouter, Depends
from typing import List
from datetime import datetime
from beanie import PydanticObjectId

from app.models.tracking import RecentlyViewed, PriceAlert
from app.models.product import Product
from app.models.user import User
from app.services.auth import get_current_active_user

router = APIRouter()

@router.post("/recently-viewed/{product_id}")
async def track_recently_viewed(
    product_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Track a product view"""
    product = await Product.get(PydanticObjectId(product_id))
    if not product:
        return {"message": "Product not found"}
    
    # Check if already exists
    existing = await RecentlyViewed.find_one(
        RecentlyViewed.user_id == str(current_user.id),
        RecentlyViewed.product_id == product_id
    )
    
    if existing:
        # Update timestamp
        existing.viewed_at = datetime.utcnow()
        await existing.save()
    else:
        # Create new entry
        recently_viewed = RecentlyViewed(
            user_id=str(current_user.id),
            product_id=product_id,
            product_name=product.name,
            product_image=product.images[0] if product.images else None,
            product_price=product.final_price
        )
        await recently_viewed.save()
    
    # Keep only last 20 viewed products
    all_viewed = await RecentlyViewed.find(
        RecentlyViewed.user_id == str(current_user.id)
    ).sort(-RecentlyViewed.viewed_at).to_list()
    
    if len(all_viewed) > 20:
        for old_view in all_viewed[20:]:
            await old_view.delete()
    
    return {"message": "Tracked successfully"}

@router.get("/recently-viewed")
async def get_recently_viewed(
    limit: int = 10,
    current_user: User = Depends(get_current_active_user)
):
    """Get user's recently viewed products"""
    viewed = await RecentlyViewed.find(
        RecentlyViewed.user_id == str(current_user.id)
    ).sort(-RecentlyViewed.viewed_at).limit(limit).to_list()
    
    return {
        "items": [
            {
                "product_id": str(v.product_id),
                "product_name": v.product_name,
                "product_image": v.product_image,
                "product_price": v.product_price,
                "viewed_at": v.viewed_at
            }
            for v in viewed
        ]
    }

@router.post("/price-alerts/{product_id}")
async def create_price_alert(
    product_id: str,
    alert_price: float,
    current_user: User = Depends(get_current_active_user)
):
    """Create a price drop alert"""
    product = await Product.get(PydanticObjectId(product_id))
    if not product:
        return {"error": "Product not found"}
    
    # Check if alert already exists
    existing = await PriceAlert.find_one(
        PriceAlert.user_id == str(current_user.id),
        PriceAlert.product_id == product_id,
        PriceAlert.is_triggered == False
    )
    
    if existing:
        existing.alert_price = alert_price
        await existing.save()
        return {"message": "Alert updated", "alert_id": str(existing.id)}
    
    alert = PriceAlert(
        user_id=str(current_user.id),
        product_id=product_id,
        original_price=product.final_price,
        alert_price=alert_price
    )
    await alert.save()
    
    return {"message": "Alert created", "alert_id": str(alert.id)}

@router.get("/price-alerts")
async def get_price_alerts(
    current_user: User = Depends(get_current_active_user)
):
    """Get user's active price alerts"""
    alerts = await PriceAlert.find(
        PriceAlert.user_id == str(current_user.id),
        PriceAlert.is_triggered == False
    ).to_list()
    
    result = []
    for alert in alerts:
        product = await Product.get(PydanticObjectId(alert.product_id))
        if product:
            result.append({
                "alert_id": str(alert.id),
                "product_id": alert.product_id,
                "product_name": product.name,
                "current_price": product.final_price,
                "alert_price": alert.alert_price,
                "price_dropped": product.final_price <= alert.alert_price,
                "created_at": alert.created_at
            })
    
    return {"alerts": result}

@router.delete("/price-alerts/{alert_id}")
async def delete_price_alert(
    alert_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete a price alert"""
    alert = await PriceAlert.get(PydanticObjectId(alert_id))
    if not alert or alert.user_id != str(current_user.id):
        return {"error": "Alert not found"}
    
    await alert.delete()
    return {"message": "Alert deleted"}

@router.get("/recommendations/{product_id}")
async def get_product_recommendations(
    product_id: str,
    limit: int = 6
):
    """Get product recommendations based on category and price range"""
    product = await Product.get(PydanticObjectId(product_id))
    if not product:
        return {"recommendations": []}
    
    # Find similar products (same category, similar price range)
    price_min = product.final_price * 0.7
    price_max = product.final_price * 1.3
    
    similar_products = await Product.find(
        Product.id != PydanticObjectId(product_id),
        Product.category == product.category,
        Product.final_price >= price_min,
        Product.final_price <= price_max,
        Product.is_active == True,
        Product.stock > 0
    ).limit(limit).to_list()
    
    # If not enough, get from same category
    if len(similar_products) < limit:
        additional = await Product.find(
            Product.id != PydanticObjectId(product_id),
            Product.category == product.category,
            Product.is_active == True,
            Product.stock > 0
        ).limit(limit - len(similar_products)).to_list()
        similar_products.extend(additional)
    
    return {
        "recommendations": [
            {
                "id": str(p.id),
                "name": p.name,
                "price": p.price,
                "final_price": p.final_price,
                "images": p.images,
                "category": p.category,
                "discount_percentage": p.discount_percentage if hasattr(p, 'discount_percentage') else 0
            }
            for p in similar_products
        ]
    }
