from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId


from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import AddToCart, UpdateCartItem, CartItemResponse, CartSummary
from app.services.auth import get_current_active_user


router = APIRouter()


@router.get("/", response_model=CartSummary)
async def get_cart(current_user: User = Depends(get_current_active_user)):
    """Get user's cart with all items"""
    
    cart_items = await CartItem.find(
        CartItem.user_id == str(current_user.id)
    ).to_list()
    
    items_response = []
    total_price = 0.0
    
    for item in cart_items:
        item_response = CartItemResponse(
            id=str(item.id),
            product_id=item.product_id,
            product_name=item.product_name,
            product_price=item.product_price,
            quantity=item.quantity,
            image_url=item.image_url,
            subtotal=item.subtotal
        )
        items_response.append(item_response)
        total_price += item.subtotal
    
    return CartSummary(
        items=items_response,
        total_items=len(items_response),
        total_price=round(total_price, 2)
    )


@router.post("/add", response_model=CartItemResponse)
async def add_to_cart(
    cart_item: AddToCart,
    current_user: User = Depends(get_current_active_user)
):
    """Add product to cart or update quantity if already exists"""
    
    # Check if product exists
    try:
        product = await Product.get(PydanticObjectId(cart_item.product_id))
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
    
    # Check stock
    if product.stock < cart_item.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {product.stock} items available in stock"
        )
    
    # Check if item already in cart
    existing_item = await CartItem.find_one(
        CartItem.user_id == str(current_user.id),
        CartItem.product_id == cart_item.product_id
    )
    
    if existing_item:
        # Update quantity
        new_quantity = existing_item.quantity + cart_item.quantity
        
        if product.stock < new_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot add {cart_item.quantity} more. Only {product.stock - existing_item.quantity} items available"
            )
        
        existing_item.quantity = new_quantity
        existing_item.updated_at = datetime.utcnow()
        await existing_item.save()
        
        return CartItemResponse(
            id=str(existing_item.id),
            product_id=existing_item.product_id,
            product_name=existing_item.product_name,
            product_price=existing_item.product_price,
            quantity=existing_item.quantity,
            image_url=existing_item.image_url,
            subtotal=existing_item.subtotal
        )
    
    # Create new cart item
    # Get main image (first image from images array, or None)
    main_image = product.images[0] if product.images and len(product.images) > 0 else None
    
    new_cart_item = CartItem(
        user_id=str(current_user.id),
        product_id=cart_item.product_id,
        product_name=product.name,
        product_price=product.final_price,
        quantity=cart_item.quantity,
        image_url=main_image  # Fixed: use main_image from images array
    )
    await new_cart_item.insert()
    
    return CartItemResponse(
        id=str(new_cart_item.id),
        product_id=new_cart_item.product_id,
        product_name=new_cart_item.product_name,
        product_price=new_cart_item.product_price,
        quantity=new_cart_item.quantity,
        image_url=new_cart_item.image_url,
        subtotal=new_cart_item.subtotal
    )


@router.put("/{item_id}", response_model=CartItemResponse)
async def update_cart_item(
    item_id: str,
    update_data: UpdateCartItem,
    current_user: User = Depends(get_current_active_user)
):
    """Update cart item quantity (set to 0 to remove)"""
    
    try:
        cart_item = await CartItem.get(PydanticObjectId(item_id))
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid cart item ID"
        )
    
    # Verify ownership
    if cart_item.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this cart item"
        )
    
    # If quantity is 0, delete the item
    if update_data.quantity == 0:
        await cart_item.delete()
        raise HTTPException(
            status_code=status.HTTP_204_NO_CONTENT,
            detail="Item removed from cart"
        )
    
    # Check product stock
    product = await Product.get(PydanticObjectId(cart_item.product_id))
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product no longer available"
        )
    
    if product.stock < update_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {product.stock} items available in stock"
        )
    
    # Update quantity
    cart_item.quantity = update_data.quantity
    cart_item.product_price = product.final_price
    cart_item.updated_at = datetime.utcnow()
    await cart_item.save()
    
    return CartItemResponse(
        id=str(cart_item.id),
        product_id=cart_item.product_id,
        product_name=cart_item.product_name,
        product_price=cart_item.product_price,
        quantity=cart_item.quantity,
        image_url=cart_item.image_url,
        subtotal=cart_item.subtotal
    )


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    item_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Remove item from cart"""
    
    try:
        cart_item = await CartItem.get(PydanticObjectId(item_id))
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid cart item ID"
        )
    
    # Verify ownership
    if cart_item.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to remove this cart item"
        )
    
    await cart_item.delete()


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(current_user: User = Depends(get_current_active_user)):
    """Clear all items from cart"""
    
    cart_items = await CartItem.find(
        CartItem.user_id == str(current_user.id)
    ).to_list()
    
    for item in cart_items:
        await item.delete()
