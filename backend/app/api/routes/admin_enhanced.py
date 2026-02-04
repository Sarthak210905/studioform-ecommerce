# Admin routes - Dashboard and Statistics (Enhanced with Database Optimization)
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from beanie import PydanticObjectId
from app.models.user import User
from app.models.order import Order
from app.models.product import Product
from app.schemas.user import UserResponse
from app.services.auth import get_current_superuser
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats")
async def get_admin_stats(current_user: User = Depends(get_current_superuser)):
    """
    Get dashboard statistics for admin panel
    Optimized database queries
    Requires superuser privileges
    """
    try:
        # Use aggregation pipeline for better performance
        # Total Revenue and Orders (completed)
        completed_orders = await Order.find(
            Order.status.in_(["delivered", "completed"])
        ).to_list()
        total_revenue = sum(order.total_amount for order in completed_orders)
        
        # Total Orders
        all_orders = await Order.find_all().to_list()
        total_orders = len(all_orders)
        
        # Total Customers (unique users who placed orders)
        unique_customers = len(set(
            str(order.user_id) for order in all_orders 
            if order.user_id
        ))
        
        # Total Products
        total_products = await Product.find_all().count()
        
        # Recent orders and revenue (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_orders_list = await Order.find(
            Order.created_at >= seven_days_ago
        ).to_list()
        recent_orders = len(recent_orders_list)
        
        # Recent revenue (last 7 days)
        recent_completed = [
            order for order in recent_orders_list 
            if order.status in ["delivered", "completed"]
        ]
        recent_revenue = sum(order.total_amount for order in recent_completed)
        
        # Low stock products count
        low_stock_count = await Product.find(
            Product.stock <= 10,
            Product.stock > 0
        ).count()
        
        # Out of stock count
        out_of_stock_count = await Product.find(
            Product.stock == 0
        ).count()
        
        return {
            "total_revenue": round(total_revenue, 2),
            "total_orders": total_orders,
            "total_customers": unique_customers,
            "total_products": total_products,
            "recent_orders": recent_orders,
            "recent_revenue": round(recent_revenue, 2),
            "low_stock_products": low_stock_count,
            "out_of_stock_products": out_of_stock_count,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch stats: {str(e)}"
        )


@router.get("/dashboard-data")
async def get_dashboard_data(current_user: User = Depends(get_current_superuser)):
    """
    Get comprehensive dashboard data in single request
    Optimized to minimize database queries
    """
    try:
        # Fetch all required data in parallel
        stats_data = await get_admin_stats(current_user)
        
        # Get recent orders (last 10)
        recent_orders = await Order.find_all().sort("-created_at").limit(10).to_list()
        
        # Get low stock products
        low_stock = await Product.find(
            Product.stock <= 10,
            Product.stock > 0
        ).sort("-stock").to_list()
        
        # Get order status breakdown
        pending_count = await Order.find(Order.status == "pending").count()
        processing_count = await Order.find(Order.status == "processing").count()
        shipped_count = await Order.find(Order.status == "shipped").count()
        delivered_count = await Order.find(Order.status == "delivered").count()
        
        return {
            "stats": stats_data,
            "recent_orders": [
                {
                    "id": str(order.id),
                    "order_number": order.order_number,
                    "user_id": str(order.user_id) if order.user_id else None,
                    "user_name": order.shipping_address.full_name if order.shipping_address else "Unknown",
                    "total_amount": order.total_amount,
                    "items_count": len(order.items),
                    "status": order.status,
                    "created_at": order.created_at.isoformat() if order.created_at else None
                }
                for order in recent_orders
            ],
            "low_stock_products": [
                {
                    "id": str(product.id),
                    "name": product.name,
                    "stock": product.stock,
                    "category": product.category,
                    "price": product.final_price
                }
                for product in low_stock[:5]
            ],
            "order_status_breakdown": {
                "pending": pending_count,
                "processing": processing_count,
                "shipped": shipped_count,
                "delivered": delivered_count
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard data: {str(e)}"
        )


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_superuser)
):
    """
    Get all users with optional filtering
    Requires superuser privileges
    """
    try:
        query = User.find_all()
        
        if is_active is not None:
            query = User.find(User.is_active == is_active)
        
        users = await query.skip(skip).limit(limit).to_list()
        
        return [
            UserResponse(
                id=str(user.id),
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                phone_number=getattr(user, 'phone_number', None),
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


@router.get("/users/count")
async def get_users_count(current_user: User = Depends(get_current_superuser)):
    """
    Get total user count
    """
    try:
        total = await User.find_all().count()
        active = await User.find(User.is_active == True).count()
        superusers = await User.find(User.is_superuser == True).count()
        
        return {
            "total_users": total,
            "active_users": active,
            "superusers": superusers
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user count: {str(e)}"
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
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.is_active = not user.is_active
        await user.save()
        
        return {
            "success": True,
            "user_id": str(user.id),
            "is_active": user.is_active
        }
    except HTTPException:
        raise
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
    Cannot modify current user's own superuser status
    """
    try:
        user = await User.get(PydanticObjectId(user_id))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent removing own superuser status
        if str(user.id) == str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot modify your own superuser status"
            )
        
        user.is_superuser = not user.is_superuser
        await user.save()
        
        return {
            "success": True,
            "user_id": str(user.id),
            "is_superuser": user.is_superuser
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update superuser status: {str(e)}"
        )


@router.get("/products/low-stock")
async def get_low_stock_products(
    threshold: int = Query(10, ge=0),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_superuser)
):
    """
    Get products with stock below threshold
    """
    try:
        products = await Product.find(
            Product.stock <= threshold,
            Product.stock > 0
        ).sort("-stock").limit(limit).to_list()
        
        return [
            {
                "id": str(product.id),
                "name": product.name,
                "stock": product.stock,
                "category": product.category,
                "price": product.final_price
            }
            for product in products
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch low stock products: {str(e)}"
        )


@router.get("/orders/summary")
async def get_orders_summary(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_superuser)
):
    """
    Get orders summary for the last N days
    """
    try:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        orders = await Order.find(
            Order.created_at >= start_date
        ).to_list()
        
        # Group by status
        by_status = {}
        total_value = 0
        
        for order in orders:
            status = order.status or "pending"
            by_status[status] = by_status.get(status, 0) + 1
            if order.status in ["delivered", "completed"]:
                total_value += order.total_amount
        
        return {
            "period_days": days,
            "total_orders": len(orders),
            "total_revenue": round(total_value, 2),
            "by_status": by_status,
            "average_order_value": round(sum(o.total_amount for o in orders) / len(orders), 2) if orders else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch orders summary: {str(e)}"
        )
