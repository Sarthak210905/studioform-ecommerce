from datetime import datetime
from typing import List
from beanie import PydanticObjectId

from app.models.product import Product
from app.models.wishlist import WishlistItem
from app.services.notification import notify_price_drop, notify_low_stock

async def check_price_drops():
    """Check for price drops on wishlist items"""
    
    # Get all wishlist items
    wishlist_items = await WishlistItem.find_all().to_list()
    
    for item in wishlist_items:
        try:
            product = await Product.get(PydanticObjectId(item.product_id))
            
            if not product or not product.is_active:
                continue
            
            # Check if price has dropped
            if hasattr(item, 'last_known_price') and item.last_known_price:
                if product.final_price < item.last_known_price:
                    # Price has dropped!
                    await notify_price_drop(
                        item.user_id,
                        product.name,
                        item.product_id,
                        item.last_known_price,
                        product.final_price
                    )
                    
                    # Update last known price
                    item.last_known_price = product.final_price
                    await item.save()
            else:
                # Set initial price
                item.last_known_price = product.final_price
                await item.save()
                
        except Exception as e:
            print(f"Error checking price for wishlist item {item.id}: {e}")
            continue

async def check_low_stock_alerts():
    """Check for low stock on wishlist items"""
    
    LOW_STOCK_THRESHOLD = 5
    
    wishlist_items = await WishlistItem.find_all().to_list()
    
    for item in wishlist_items:
        try:
            product = await Product.get(PydanticObjectId(item.product_id))
            
            if not product or not product.is_active:
                continue
            
            # Check if stock is low
            if 0 < product.stock <= LOW_STOCK_THRESHOLD:
                # Check if we haven't notified recently
                if not hasattr(item, 'last_stock_alert') or not item.last_stock_alert:
                    await notify_low_stock(
                        item.user_id,
                        product.name,
                        item.product_id
                    )
                    
                    # Mark as notified
                    item.last_stock_alert = datetime.utcnow()
                    await item.save()
                    
        except Exception as e:
            print(f"Error checking stock for wishlist item {item.id}: {e}")
            continue
