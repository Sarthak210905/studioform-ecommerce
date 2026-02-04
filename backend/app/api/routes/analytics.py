from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from datetime import datetime, timedelta
from typing import List
import io
import csv
from beanie import PydanticObjectId

from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from app.models.review import Review
from app.services.auth import get_current_active_user

router = APIRouter()

@router.get("/sales-summary")
async def get_sales_summary(
    days: int = 30,
    current_user: User = Depends(get_current_active_user)
):
    """Get sales summary for last N days (Admin only)"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    orders = await Order.find({
        "created_at": {"$gte": start_date},
        "payment_status": {"$in": ["paid", "cod"]},
    }).to_list()
    
    total_revenue = sum(order.total_amount for order in orders)
    total_orders = len(orders)
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    # Group by status
    status_breakdown = {}
    for order in orders:
        status_breakdown[order.status] = status_breakdown.get(order.status, 0) + 1
    
    # Daily revenue
    daily_revenue = {}
    for order in orders:
        date_key = order.created_at.strftime("%Y-%m-%d")
        daily_revenue[date_key] = daily_revenue.get(date_key, 0) + order.total_amount
    
    return {
        "period_days": days,
        "total_revenue": round(total_revenue, 2),
        "total_orders": total_orders,
        "average_order_value": round(avg_order_value, 2),
        "status_breakdown": status_breakdown,
        "daily_revenue": daily_revenue
    }

@router.get("/top-products")
async def get_top_products(
    limit: int = 10,
    current_user: User = Depends(get_current_active_user)
):
    """Get top selling products (Admin only)"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    orders = await Order.find({
        "payment_status": {"$in": ["paid", "cod"]},
    }).to_list()
    
    # Count product sales
    product_sales = {}
    product_revenue = {}
    
    for order in orders:
        for item in order.items:
            product_id = item.product_id
            product_sales[product_id] = product_sales.get(product_id, 0) + item.quantity
            product_revenue[product_id] = product_revenue.get(product_id, 0) + item.subtotal
    
    # Sort by quantity sold
    sorted_products = sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:limit]
    
    # Get product details
    top_products = []
    for product_id, quantity in sorted_products:
        try:
            product = await Product.get(PydanticObjectId(product_id))
            if product:
                top_products.append({
                    "product_id": product_id,
                    "product_name": product.name,
                    "quantity_sold": quantity,
                    "revenue": round(product_revenue.get(product_id, 0), 2),
                    "current_stock": product.stock,
                    "image": product.main_image
                })
        except:
            continue
    
    return {"top_products": top_products}

@router.get("/low-stock")
async def get_low_stock_products(
    threshold: int = 10,
    current_user: User = Depends(get_current_active_user)
):
    """Get products with low stock (Admin only)"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    products = await Product.find(
        Product.stock <= threshold,
        Product.is_active == True
    ).to_list()
    
    low_stock = [
        {
            "product_id": str(product.id),
            "name": product.name,
            "current_stock": product.stock,
            "price": product.price,
            "image": product.main_image
        }
        for product in products
    ]
    
    return {
        "threshold": threshold,
        "count": len(low_stock),
        "products": low_stock
    }

@router.get("/customer-stats")
async def get_customer_stats(current_user: User = Depends(get_current_active_user)):
    """Get customer statistics (Admin only)"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Total customers
    total_customers = await User.find(User.is_superuser == False).count()
    
    # Customers with orders
    orders = await Order.find_all().to_list()
    unique_customers = len(set(order.user_id for order in orders))
    
    # Customer lifetime value
    customer_spending = {}
    for order in orders:
        if order.payment_status in ["paid", "cod"]:
            customer_spending[order.user_id] = customer_spending.get(order.user_id, 0) + order.total_amount
    
    if customer_spending:
        avg_customer_value = sum(customer_spending.values()) / len(customer_spending)
        top_customers = sorted(customer_spending.items(), key=lambda x: x[1], reverse=True)[:10]
    else:
        avg_customer_value = 0
        top_customers = []
    
    return {
        "total_registered": total_customers,
        "customers_with_orders": unique_customers,
        "average_customer_lifetime_value": round(avg_customer_value, 2),
        "top_customers": [
            {"user_id": user_id, "total_spent": round(spent, 2)}
            for user_id, spent in top_customers
        ]
    }

@router.get("/order-stats")
async def get_order_statistics(current_user: User = Depends(get_current_active_user)):
    """Get order statistics (Admin only)"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    all_orders = await Order.find_all().to_list()
    
    total_orders = len(all_orders)
    
    # By status
    by_status = {}
    for order in all_orders:
        by_status[order.status] = by_status.get(order.status, 0) + 1
    
    # By payment method
    by_payment = {}
    for order in all_orders:
        by_payment[order.payment_method] = by_payment.get(order.payment_method, 0) + 1
    
    # By payment status
    by_payment_status = {}
    for order in all_orders:
        by_payment_status[order.payment_status] = by_payment_status.get(order.payment_status, 0) + 1
    
    return {
        "total_orders": total_orders,
        "by_status": by_status,
        "by_payment_method": by_payment,
        "by_payment_status": by_payment_status
    }

@router.get("/revenue-by-period")
async def get_revenue_by_period(
    period: str = "daily",  # daily, weekly, monthly
    current_user: User = Depends(get_current_active_user)
):
    """Get revenue grouped by period (Admin only)"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    orders = await Order.find(
        Order.payment_status.in_(["paid", "cod"])
    ).to_list()
    
    revenue_data = {}
    
    for order in orders:
        if period == "daily":
            key = order.created_at.strftime("%Y-%m-%d")
        elif period == "weekly":
            key = order.created_at.strftime("%Y-W%U")
        elif period == "monthly":
            key = order.created_at.strftime("%Y-%m")
        else:
            key = order.created_at.strftime("%Y-%m-%d")
        
        revenue_data[key] = revenue_data.get(key, 0) + order.total_amount
    
    return {
        "period": period,
        "data": {k: round(v, 2) for k, v in sorted(revenue_data.items())}
    }

@router.get("/export/orders-csv")
async def export_orders_csv(
    days: int = 30,
    current_user: User = Depends(get_current_active_user)
):
    """Export orders to CSV (Admin only)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    start_date = datetime.utcnow() - timedelta(days=days)
    orders = await Order.find(Order.created_at >= start_date).to_list()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Order Number", "Date", "Customer Email", "Total Amount",
        "Payment Method", "Payment Status", "Order Status", 
        "Items Count", "Shipping Cost", "Discount", "Tax"
    ])
    
    # Data
    for order in orders:
        writer.writerow([
            order.order_number,
            order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            getattr(order, 'user_email', 'N/A'),
            order.total_amount,
            order.payment_method,
            order.payment_status,
            order.status,
            len(order.items),
            order.shipping_cost,
            order.discount_amount,
            order.tax
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=orders_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
    )

@router.get("/export/products-csv")
async def export_products_csv(
    current_user: User = Depends(get_current_active_user)
):
    """Export products to CSV (Admin only)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    products = await Product.find_all().to_list()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Product ID", "Name", "Category", "Brand", "Price", 
        "Final Price", "Stock", "Status", "Created Date"
    ])
    
    # Data
    for product in products:
        writer.writerow([
            str(product.id),
            product.name,
            product.category or "N/A",
            product.brand or "N/A",
            product.price,
            product.final_price,
            product.stock,
            "Active" if product.is_active else "Inactive",
            product.created_at.strftime("%Y-%m-%d") if hasattr(product, 'created_at') else "N/A"
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=products_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
    )

@router.get("/sales/by-category")
async def get_sales_by_category(
    days: int = 30,
    current_user: User = Depends(get_current_active_user)
):
    """Get sales breakdown by category (Admin only)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    start_date = datetime.utcnow() - timedelta(days=days)
    orders = await Order.find(
        Order.created_at >= start_date,
        Order.payment_status.in_(["paid", "cod"])
    ).to_list()
    
    # Get all products to map categories
    products = await Product.find_all().to_list()
    product_categories = {str(p.id): p.category for p in products}
    
    # Aggregate by category
    category_stats = {}
    for order in orders:
        for item in order.items:
            category = product_categories.get(str(item.product_id), "Uncategorized")
            if category not in category_stats:
                category_stats[category] = {"revenue": 0, "units": 0, "orders": 0}
            category_stats[category]["revenue"] += item.subtotal
            category_stats[category]["units"] += item.quantity
            category_stats[category]["orders"] += 1
    
    result = [
        {"category": cat, **stats}
        for cat, stats in sorted(category_stats.items(), key=lambda x: x[1]["revenue"], reverse=True)
    ]
    
    return {"categories": result}
