from app.models.coupon import Coupon
from typing import Optional

async def validate_and_apply_coupon(
    coupon_code: str,
    user_id: str,
    subtotal: float
) -> dict:
    """Validate and calculate coupon discount"""
    
    # Find coupon
    coupon = await Coupon.find_one(Coupon.code == coupon_code.upper())
    
    if not coupon:
        return {
            "valid": False,
            "message": "Invalid coupon code",
            "discount_amount": 0.0
        }
    
    # Check if valid
    if not coupon.is_valid():
        return {
            "valid": False,
            "message": "Coupon has expired or is no longer active",
            "discount_amount": 0.0
        }
    
    # Check user usage limit
    if not coupon.can_user_use(user_id):
        return {
            "valid": False,
            "message": "You have already used this coupon maximum times",
            "discount_amount": 0.0
        }
    
    # Check minimum order amount
    if subtotal < coupon.min_order_amount:
        return {
            "valid": False,
            "message": f"Minimum order amount of ₹{coupon.min_order_amount} required",
            "discount_amount": 0.0
        }
    
    # Calculate discount
    discount_amount = coupon.calculate_discount(subtotal)
    
    return {
        "valid": True,
        "message": f"Coupon applied successfully! You saved ₹{discount_amount}",
        "discount_amount": discount_amount,
        "coupon_id": str(coupon.id),
        "coupon_code": coupon.code
    }

async def mark_coupon_used(coupon_code: str, user_id: str):
    """Mark coupon as used by user"""
    coupon = await Coupon.find_one(Coupon.code == coupon_code.upper())
    if coupon:
        coupon.usage_count += 1
        coupon.used_by.append(user_id)
        await coupon.save()
