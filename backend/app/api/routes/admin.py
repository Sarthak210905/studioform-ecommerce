# Admin routes - Dashboard and Statistics
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from app.services.email import send_email
from beanie import PydanticObjectId
from app.models.user import User
from app.models.order import Order
from app.models.product import Product
from app.schemas.user import UserResponse
from app.services.auth import get_current_superuser
from datetime import datetime, timedelta

router = APIRouter()


class NewsletterPayload(BaseModel):
    subject: str
    html_body: str
    preview_text: Optional[str] = None
    test_email: Optional[EmailStr] = None

@router.get("/stats")
async def get_admin_stats(current_user: User = Depends(get_current_superuser)):
    """
    Get dashboard statistics for admin panel
    Requires superuser privileges
    """
    try:
        # Total Revenue (from completed orders)
        all_orders_list = await Order.find_all().to_list()
        completed_orders = [order for order in all_orders_list if order.status in ["delivered", "completed"]]
        total_revenue = sum(order.total_amount for order in completed_orders)
        
        # Total Orders
        total_orders = len(all_orders_list)
        
        # Total Customers (unique users who placed orders)
        unique_customers = len(set(order.user_id for order in all_orders_list if order.user_id))
        
        # Total Products
        all_products = await Product.find_all().to_list()
        total_products = len(all_products)
        
        # Recent orders count (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_orders_list = [order for order in all_orders_list if order.created_at >= seven_days_ago]
        recent_orders = len(recent_orders_list)
        
        # Recent revenue (last 7 days)
        recent_completed = [order for order in recent_orders_list if order.status in ["delivered", "completed"]]
        recent_revenue = sum(order.total_amount for order in recent_completed)
        
        return {
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "total_customers": unique_customers,
            "total_products": total_products,
            "recent_orders": recent_orders,
            "recent_revenue": recent_revenue
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/newsletter/send")
async def send_newsletter(
    payload: NewsletterPayload,
    current_user: User = Depends(get_current_superuser)
):
    """
    Send a newsletter to all active, verified users or to a test email if provided.
    """
    try:
        if payload.test_email:
            recipients = [payload.test_email]
        else:
            users = await User.find(
                User.is_active == True,  # noqa: E712
                User.is_verified == True  # noqa: E712
            ).to_list()
            recipients = [u.email for u in users if getattr(u, "email", None)]

        if not recipients:
            raise HTTPException(status_code=404, detail="No recipients available")

        html_body = payload.html_body
        if payload.preview_text:
            html_body = f"<p style=\"color:#555;font-size:14px;margin:0 0 16px;\">{payload.preview_text}</p>" + payload.html_body

        sent_count = 0
        failed: List[str] = []

        for email in recipients:
            success = await send_email(email, payload.subject, html_body)
            if success:
                sent_count += 1
            else:
                failed.append(email)

        return {
            "requested": len(recipients),
            "sent": sent_count,
            "failed": failed,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send newsletter: {str(e)}")


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_superuser)
):
    """
    Get all users (admin only)
    Requires superuser privileges
    """
    try:
        users = await User.find_all().skip(skip).limit(limit).to_list()
        
        return [
            UserResponse(
                id=str(user.id),
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                phone_number=user.phone_number,
                is_active=user.is_active,
                is_verified=user.is_verified,
                is_superuser=user.is_superuser,
                created_at=user.created_at
            )
            for user in users
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )


@router.put("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: str,
    current_user: User = Depends(get_current_superuser)
):
    """
    Toggle user active status (admin only)
    """
    try:
        user = await User.get(PydanticObjectId(user_id))
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.is_active = not user.is_active
        await user.save()
        
        return {"success": True, "is_active": user.is_active}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user status: {str(e)}"
        )


@router.put("/users/{user_id}/toggle-superuser")
async def toggle_superuser_status(
    user_id: str,
    current_user: User = Depends(get_current_superuser)
):
    """
    Toggle user superuser status (admin only)
    """
    try:
        user = await User.get(PydanticObjectId(user_id))
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Prevent removing own superuser status
        if str(user.id) == str(current_user.id):
            raise HTTPException(
                status_code=400,
                detail="Cannot modify your own superuser status"
            )
        
        user.is_superuser = not user.is_superuser
        await user.save()
        
        return {"success": True, "is_superuser": user.is_superuser}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update superuser status: {str(e)}"
        )

