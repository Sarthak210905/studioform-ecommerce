from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId

from app.models.coupon import Coupon
from app.models.user import User
from app.schemas.coupon import CouponCreate, CouponResponse, ApplyCoupon, CouponValidation
from app.services.auth import get_current_active_user
from app.services.coupon import validate_and_apply_coupon

router = APIRouter()

@router.post("/validate", response_model=CouponValidation)
async def validate_coupon(
    coupon_data: ApplyCoupon,
    subtotal: float,
    current_user: User = Depends(get_current_active_user)
):
    """Validate coupon code and calculate discount"""
    
    result = await validate_and_apply_coupon(
        coupon_data.coupon_code,
        str(current_user.id),
        subtotal
    )
    
    return CouponValidation(**result)

@router.get("/", response_model=List[CouponResponse])
async def get_active_coupons():
    """Get all active coupons (public)"""
    
    coupons = await Coupon.find(
        Coupon.is_active == True
    ).to_list()
    
    # Filter valid coupons
    valid_coupons = [c for c in coupons if c.is_valid()]
    
    return [
        CouponResponse(
            id=str(coupon.id),
            code=coupon.code,
            description=coupon.description,
            discount_type=coupon.discount_type,
            discount_value=coupon.discount_value,
            min_order_amount=coupon.min_order_amount,
            max_discount_amount=coupon.max_discount_amount,
            usage_limit=coupon.usage_limit,
            usage_count=coupon.usage_count,
            per_user_limit=coupon.per_user_limit,
            is_active=coupon.is_active,
            starts_at=coupon.starts_at,
            expires_at=coupon.expires_at
        )
        for coupon in valid_coupons
    ]

# Admin routes
@router.post("/admin/create", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
async def create_coupon(
    coupon_data: CouponCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Create new coupon"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Check if code already exists
    existing = await Coupon.find_one(Coupon.code == coupon_data.code.upper())
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coupon code already exists"
        )
    
    # Create coupon
    coupon = Coupon(
        code=coupon_data.code.upper(),
        description=coupon_data.description,
        discount_type=coupon_data.discount_type,
        discount_value=coupon_data.discount_value,
        min_order_amount=coupon_data.min_order_amount,
        max_discount_amount=coupon_data.max_discount_amount,
        usage_limit=coupon_data.usage_limit,
        per_user_limit=coupon_data.per_user_limit,
        starts_at=coupon_data.starts_at,
        expires_at=coupon_data.expires_at,
        created_by=str(current_user.id)
    )
    await coupon.insert()
    
    return CouponResponse(
        id=str(coupon.id),
        code=coupon.code,
        description=coupon.description,
        discount_type=coupon.discount_type,
        discount_value=coupon.discount_value,
        min_order_amount=coupon.min_order_amount,
        max_discount_amount=coupon.max_discount_amount,
        usage_limit=coupon.usage_limit,
        usage_count=coupon.usage_count,
        per_user_limit=coupon.per_user_limit,
        is_active=coupon.is_active,
        starts_at=coupon.starts_at,
        expires_at=coupon.expires_at
    )

@router.get("/admin/all", response_model=List[CouponResponse])
async def get_all_coupons(current_user: User = Depends(get_current_active_user)):
    """Admin: Get all coupons"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    coupons = await Coupon.find_all().to_list()
    
    return [
        CouponResponse(
            id=str(coupon.id),
            code=coupon.code,
            description=coupon.description,
            discount_type=coupon.discount_type,
            discount_value=coupon.discount_value,
            min_order_amount=coupon.min_order_amount,
            max_discount_amount=coupon.max_discount_amount,
            usage_limit=coupon.usage_limit,
            usage_count=coupon.usage_count,
            per_user_limit=coupon.per_user_limit,
            is_active=coupon.is_active,
            starts_at=coupon.starts_at,
            expires_at=coupon.expires_at
        )
        for coupon in coupons
    ]

@router.delete("/admin/{coupon_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_coupon(
    coupon_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Delete coupon"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        coupon = await Coupon.get(PydanticObjectId(coupon_id))
        if not coupon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coupon not found"
            )
        await coupon.delete()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid coupon ID"
        )

@router.put("/admin/{coupon_id}/toggle", response_model=CouponResponse)
async def toggle_coupon_status(
    coupon_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Activate/deactivate coupon"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        coupon = await Coupon.get(PydanticObjectId(coupon_id))
        if not coupon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coupon not found"
            )
        
        coupon.is_active = not coupon.is_active
        await coupon.save()
        
        return CouponResponse(
            id=str(coupon.id),
            code=coupon.code,
            description=coupon.description,
            discount_type=coupon.discount_type,
            discount_value=coupon.discount_value,
            min_order_amount=coupon.min_order_amount,
            max_discount_amount=coupon.max_discount_amount,
            usage_limit=coupon.usage_limit,
            usage_count=coupon.usage_count,
            per_user_limit=coupon.per_user_limit,
            is_active=coupon.is_active,
            starts_at=coupon.starts_at,
            expires_at=coupon.expires_at
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid coupon ID"
        )
