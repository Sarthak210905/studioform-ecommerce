from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId

from app.models.wishlist import WishlistItem
from app.models.product import Product
from app.models.user import User
from app.schemas.wishlist import AddToWishlist, WishlistItemResponse
from app.services.auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[WishlistItemResponse])
async def get_wishlist(current_user: User = Depends(get_current_active_user)):
    """Get user's wishlist"""
    
    wishlist_items = await WishlistItem.find(
        WishlistItem.user_id == str(current_user.id)
    ).sort(-WishlistItem.added_at).to_list()
    
    response = []
    for item in wishlist_items:
        # Get product details
        try:
            product = await Product.get(PydanticObjectId(item.product_id))
            if product:
                response.append(WishlistItemResponse(
                    id=str(item.id),
                    product_id=item.product_id,
                    product_name=product.name,
                    product_price=product.price,
                    final_price=product.final_price,
                    discount_percentage=product.savings_percentage,
                    image_url=product.main_image or "",
                    in_stock=product.is_in_stock,
                    added_at=item.added_at
                ))
        except Exception:
            # Product deleted, skip
            continue
    
    return response

@router.post("/add", response_model=WishlistItemResponse)
async def add_to_wishlist(
    wishlist_data: AddToWishlist,
    current_user: User = Depends(get_current_active_user)
):
    """Add product to wishlist"""
    
    # Check if product exists
    try:
        product = await Product.get(PydanticObjectId(wishlist_data.product_id))
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
    
    # Check if already in wishlist
    existing = await WishlistItem.find_one(
        WishlistItem.user_id == str(current_user.id),
        WishlistItem.product_id == wishlist_data.product_id
    )
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product already in wishlist"
        )
    
    # Add to wishlist
    wishlist_item = WishlistItem(
        user_id=str(current_user.id),
        product_id=wishlist_data.product_id
    )
    await wishlist_item.insert()
    
    return WishlistItemResponse(
        id=str(wishlist_item.id),
        product_id=wishlist_item.product_id,
        product_name=product.name,
        product_price=product.price,
        final_price=product.final_price,
        discount_percentage=product.savings_percentage,
        image_url=product.main_image or "",
        in_stock=product.is_in_stock,
        added_at=wishlist_item.added_at
    )

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Remove product from wishlist"""
    
    wishlist_item = await WishlistItem.find_one(
        WishlistItem.user_id == str(current_user.id),
        WishlistItem.product_id == product_id
    )
    
    if not wishlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not in wishlist"
        )
    
    await wishlist_item.delete()

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_wishlist(current_user: User = Depends(get_current_active_user)):
    """Clear entire wishlist"""
    
    wishlist_items = await WishlistItem.find(
        WishlistItem.user_id == str(current_user.id)
    ).to_list()
    
    for item in wishlist_items:
        await item.delete()

@router.get("/check/{product_id}")
async def check_in_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Check if product is in wishlist"""
    
    wishlist_item = await WishlistItem.find_one(
        WishlistItem.user_id == str(current_user.id),
        WishlistItem.product_id == product_id
    )
    
    return {"in_wishlist": wishlist_item is not None}
