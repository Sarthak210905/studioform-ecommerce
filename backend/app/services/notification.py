from app.models.notification import Notification

async def create_notification(
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
    link: str = None
):
    """Create a notification for user"""
    notification = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        link=link
    )
    await notification.insert()
    return notification

async def notify_order_status_change(user_id: str, order_number: str, new_status: str):
    """Send notification when order status changes"""
    await create_notification(
        user_id=user_id,
        notification_type="order_update",
        title=f"Order {new_status.title()}",
        message=f"Your order #{order_number} is now {new_status}",
        # Frontend route expects order id; we don't have it here, so link to list page
        link="/orders"
    )

async def notify_low_stock(user_id: str, product_name: str, product_id: str):
    """Notify user about low stock on wishlist item"""
    await create_notification(
        user_id=user_id,
        notification_type="stock_alert",
        title="Low Stock Alert",
        message=f"{product_name} is running low on stock. Order now!",
        link=f"/products/{product_id}"
    )

async def notify_price_drop(user_id: str, product_name: str, product_id: str, old_price: float, new_price: float):
    """Notify user about price drop on wishlist item"""
    await create_notification(
        user_id=user_id,
        notification_type="price_drop",
        title="Price Drop Alert! 🎉",
        message=f"{product_name} price dropped from ₹{old_price} to ₹{new_price}",
        link=f"/products/{product_id}"
    )
