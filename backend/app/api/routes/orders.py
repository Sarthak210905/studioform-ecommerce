from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId
from fastapi.responses import StreamingResponse
from app.services.invoice import generate_invoice_pdf
from app.models.order import Order, OrderItem
from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import (
    CreateOrder, OrderResponse, OrderSummary, 
    UpdateOrderStatus, OrderItemResponse, ShippingAddress
)
from app.services.auth import get_current_active_user
from app.services.order import generate_order_number, calculate_order_totals
from app.services.email import send_email, send_order_confirmation_email, send_order_shipped_email, send_order_delivered_email
from app.services.notification import notify_order_status_change

router = APIRouter()

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: CreateOrder,
    current_user: User = Depends(get_current_active_user)
):
    """Place order from cart with coupon and dynamic shipping"""
    
    # Get cart items
    cart_items = await CartItem.find(
        CartItem.user_id == str(current_user.id)
    ).to_list()
    
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # Verify stock and prepare order items
    order_items = []
    subtotal = 0.0
    
    for cart_item in cart_items:
        # Get current product
        product = await Product.get(PydanticObjectId(cart_item.product_id))
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {cart_item.product_name} no longer available"
            )
        
        if product.stock < cart_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}. Only {product.stock} available"
            )
        
        # Create order item (UPDATED: use main_image and final_price)
        # Get the final price (after discount) and original price
        final_price = product.final_price
        original_price = product.price
        
        # Calculate discount percentage if there's a price difference
        discount_pct = 0.0
        if original_price > final_price:
            discount_pct = ((original_price - final_price) / original_price) * 100
        
        # Calculate item subtotal using final price
        item_subtotal = final_price * cart_item.quantity
        
        order_item = OrderItem(
            product_id=str(product.id),
            product_name=product.name,
            product_price=final_price,  # Use final_price for the order
            original_price=original_price if discount_pct > 0 else None,
            discount_percentage=discount_pct,
            quantity=cart_item.quantity,
            image_url=product.main_image,  # CHANGED from product.image_url
            subtotal=item_subtotal
        )
        order_items.append(order_item)
        subtotal += item_subtotal
    
    # Apply coupon if provided
    discount_amount = 0.0
    coupon_code = None
    
    if order_data.coupon_code:
        from app.services.coupon import validate_and_apply_coupon, mark_coupon_used
        
        coupon_result = await validate_and_apply_coupon(
            order_data.coupon_code,
            str(current_user.id),
            subtotal
        )
        
        if coupon_result["valid"]:
            discount_amount = coupon_result["discount_amount"]
            coupon_code = order_data.coupon_code.upper()
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=coupon_result["message"]
            )
    
    # Calculate shipping based on location
    from app.services.shipping import calculate_shipping_cost
    
    # Determine payment mode for shipping calculation
    payment_mode = 'COD' if order_data.payment_method == 'cod' else 'Prepaid'
    
    # Calculate potential COD amount (used if payment_method is COD)
    potential_total = subtotal - discount_amount + (subtotal - discount_amount) * 0.02  # Rough estimate with 2% platform fee
    
    shipping_result = await calculate_shipping_cost(
        order_data.shipping_address.pincode,
        order_data.shipping_address.state,
        subtotal - discount_amount,
        weight_kg=1.0,
        payment_mode=payment_mode,
        cod_amount=potential_total if payment_mode == 'COD' else 0.0
    )
    
    shipping_cost = shipping_result["shipping_cost"]
    shipping_zone = shipping_result["zone_name"]
    estimated_delivery = shipping_result["estimated_days"]
    
    # Calculate platform fee (2% on subtotal - discount)
    fee_base_amount = subtotal - discount_amount
    platform_fee = round(fee_base_amount * 0.02, 2)
    
    # Calculate total
    total_amount = round(subtotal - discount_amount + shipping_cost + platform_fee, 2)
    
    # Generate order number
    order_number = generate_order_number()
    
    # Determine payment status based on payment method (ADDED)
    payment_status = "pending"
    order_status = "pending"
    
    if order_data.payment_method == "cod":
        payment_status = "cod"
        order_status = "pending"
    elif order_data.payment_method == "razorpay":
        payment_status = "pending"
        order_status = "pending"
    
    # Create order
    order = Order(
        user_id=str(current_user.id),
        order_number=order_number,
        items=order_items,
        subtotal=round(subtotal, 2),
        shipping_cost=shipping_cost,
        tax=platform_fee,
        discount_amount=discount_amount,
        coupon_code=coupon_code,
        total_amount=total_amount,
        payment_method=order_data.payment_method,
        payment_status=payment_status,  # ADDED
        status=order_status,  # ADDED
        shipping_address=order_data.shipping_address.model_dump(),
        shipping_zone=shipping_zone,
        estimated_delivery=estimated_delivery
    )
    await order.insert()
    
    # Mark coupon as used only for COD (for Razorpay, coupon is marked after payment verification)
    if coupon_code and order_data.payment_method == "cod":
        from app.services.coupon import mark_coupon_used
        await mark_coupon_used(coupon_code, str(current_user.id))
    
    # For COD orders - update stock immediately (ADDED)
    if order_data.payment_method == "cod":
        for cart_item in cart_items:
            product = await Product.get(PydanticObjectId(cart_item.product_id))
            product.stock -= cart_item.quantity
            await product.save()
        
        # Clear cart for COD orders
        for cart_item in cart_items:
            await cart_item.delete()
        
        # Send order confirmation email for COD
        user = await User.get(PydanticObjectId(current_user.id))
        if user:
            await send_order_confirmation_email(user.email, order)
    
    # For Razorpay orders - stock will be updated after payment verification
    # Cart will be cleared after payment
    
    return OrderResponse(
        id=str(order.id),
        order_number=order.order_number,
        items=[OrderItemResponse(
            product_id=item.product_id,
            product_name=item.product_name,
            product_price=item.product_price,
            original_price=item.original_price,
            discount_percentage=item.discount_percentage,
            quantity=item.quantity,
            image_url=item.image_url,
            subtotal=item.subtotal
        ) for item in order.items],
        subtotal=order.subtotal,
        shipping_cost=order.shipping_cost,
        tax=order.tax,
        discount_amount=order.discount_amount,
        coupon_code=order.coupon_code,
        total_amount=order.total_amount,
        status=order.status,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        shipping_address=ShippingAddress(**order.shipping_address),
        shipping_zone=order.shipping_zone,
        estimated_delivery=order.estimated_delivery,
        created_at=order.created_at
    )

@router.get("/", response_model=List[OrderSummary])
async def get_my_orders(current_user: User = Depends(get_current_active_user)):
    """Get user's order history"""
    
    orders = await Order.find(
        Order.user_id == str(current_user.id)
    ).sort(-Order.created_at).to_list()
    
    return [
        OrderSummary(
            id=str(order.id),
            order_number=order.order_number,
            total_amount=order.total_amount,
            status=order.status,
            payment_status=order.payment_status,
            created_at=order.created_at,
            items_count=len(order.items)
        )
        for order in orders
    ]

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_details(
    order_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get order details"""
    
    try:
        order = await Order.get(PydanticObjectId(order_id))
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    # Verify ownership (unless admin)
    if order.user_id != str(current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    return OrderResponse(
        id=str(order.id),
        order_number=order.order_number,
        items=[OrderItemResponse(
            product_id=item.product_id,
            product_name=item.product_name,
            product_price=item.product_price,
            quantity=item.quantity,
            image_url=item.image_url,
            subtotal=item.subtotal
        ) for item in order.items],
        subtotal=order.subtotal,
        shipping_cost=order.shipping_cost,
        tax=order.tax,
        discount_amount=order.discount_amount,
        coupon_code=order.coupon_code,
        total_amount=order.total_amount,
        status=order.status,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        shipping_address=ShippingAddress(**order.shipping_address),
        shipping_zone=order.shipping_zone,
        estimated_delivery=order.estimated_delivery,
        created_at=order.created_at
    )

@router.put("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Cancel order (only if pending or processing)"""
    
    try:
        order = await Order.get(PydanticObjectId(order_id))
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    # Verify ownership
    if order.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this order"
        )
    
    # Check if can be cancelled
    if order.status not in ["pending", "processing"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel order with status: {order.status}"
        )
    
    # Restore stock
    for item in order.items:
        product = await Product.get(PydanticObjectId(item.product_id))
        if product:
            product.stock += item.quantity
            await product.save()
    
    # Update order status
    order.status = "cancelled"
    order.updated_at = datetime.utcnow()
    await order.save()
    
    return OrderResponse(
        id=str(order.id),
        order_number=order.order_number,
        items=[OrderItemResponse(
            product_id=item.product_id,
            product_name=item.product_name,
            product_price=item.product_price,
            quantity=item.quantity,
            image_url=item.image_url,
            subtotal=item.subtotal
        ) for item in order.items],
        subtotal=order.subtotal,
        shipping_cost=order.shipping_cost,
        tax=order.tax,
        discount_amount=order.discount_amount,
        coupon_code=order.coupon_code,
        total_amount=order.total_amount,
        status=order.status,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        shipping_address=ShippingAddress(**order.shipping_address),
        shipping_zone=order.shipping_zone,
        estimated_delivery=order.estimated_delivery,
        created_at=order.created_at
    )

# Admin routes
@router.get("/admin/all", response_model=List[OrderSummary])
async def get_all_orders(current_user: User = Depends(get_current_active_user)):
    """Admin: Get all orders"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    orders = await Order.find_all().sort(-Order.created_at).to_list()
    
    return [
        OrderSummary(
            id=str(order.id),
            order_number=order.order_number,
            total_amount=order.total_amount,
            status=order.status,
            payment_status=order.payment_status,
            created_at=order.created_at,
            items_count=len(order.items)
        )
        for order in orders
    ]



# In the update_order_status function, ADD THIS before saving:
@router.put("/admin/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    status_update: UpdateOrderStatus,
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Update order status"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        order = await Order.get(PydanticObjectId(order_id))
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    old_status = order.status
    order.status = status_update.status
    order.updated_at = datetime.utcnow()
    await order.save()
    
    # Send notification (NEW)
    await notify_order_status_change(
        order.user_id,
        order.order_number,
        status_update.status
    )
    
    # Send status update email based on new status
    user = await User.get(PydanticObjectId(order.user_id))
    if user:
        if status_update.status == 'shipped':
            tracking_url = order.tracking_url if hasattr(order, 'tracking_url') else None
            await send_order_shipped_email(user.email, order.order_number, tracking_url)
        elif status_update.status == 'delivered':
            await send_order_delivered_email(user.email, order.order_number)
    
    return OrderResponse(
        id=str(order.id),
        order_number=order.order_number,
        items=[OrderItemResponse(
            product_id=item.product_id,
            product_name=item.product_name,
            product_price=item.product_price,
            quantity=item.quantity,
            image_url=item.image_url,
            subtotal=item.subtotal
        ) for item in order.items],
        subtotal=order.subtotal,
        shipping_cost=order.shipping_cost,
        tax=order.tax,
        discount_amount=order.discount_amount,
        coupon_code=order.coupon_code,
        total_amount=order.total_amount,
        status=order.status,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        shipping_address=ShippingAddress(**order.shipping_address),
        shipping_zone=order.shipping_zone,
        estimated_delivery=order.estimated_delivery,
        created_at=order.created_at
    )


@router.get("/{order_id}/invoice")
async def download_invoice(
    order_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Download order invoice as PDF"""
    
    try:
        order = await Order.get(PydanticObjectId(order_id))
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    # Verify ownership or admin
    if order.user_id != str(current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Generate PDF
    pdf_buffer = generate_invoice_pdf(order)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=invoice_{order.order_number}.pdf"
        }
    )

# Email helpers (UPDATED)
async def send_order_confirmation_email(to_email: str, order: Order):
    """Send order confirmation email"""
    subject = f"Order Confirmation - {order.order_number}"
    
    items_html = ""
    for item in order.items:
        items_html += f"""
        <tr>
            <td>{item.product_name}</td>
            <td>{item.quantity}</td>
            <td>₹{item.product_price}</td>
            <td>₹{item.subtotal}</td>
        </tr>
        """
    
    discount_html = ""
    if order.discount_amount > 0:
        discount_html = f'<p><strong>Discount ({order.coupon_code}):</strong> <span style="color: #4CAF50;">- ₹{order.discount_amount}</span></p>'
    
    payment_method_display = "Cash on Delivery" if order.payment_method == "cod" else "Online Payment"
    
    body = f"""
    <h3 style="color: #4CAF50;">Order Placed Successfully!</h3>
    <p>Thank you for your order. Your order number is: <strong>{order.order_number}</strong></p>
    
    <h4>Order Details:</h4>
    <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f5f5f5;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: left;">Qty</th>
            <th style="padding: 10px; text-align: left;">Price</th>
            <th style="padding: 10px; text-align: left;">Subtotal</th>
        </tr>
        {items_html}
    </table>
    
    <div style="margin-top: 20px;">
        <p><strong>Subtotal:</strong> ₹{order.subtotal}</p>
        {discount_html}
        <p><strong>Shipping ({order.shipping_zone}):</strong> ₹{order.shipping_cost}</p>
        <p><strong>Platform Fee (2%):</strong> ₹{order.tax}</p>
        <p style="font-size: 18px;"><strong>Total:</strong> ₹{order.total_amount}</p>
    </div>
    
    <div style="margin-top: 20px; padding: 15px; background: #f0f8ff; border-left: 4px solid #2196F3;">
        <p><strong>Payment Method:</strong> {payment_method_display}</p>
        <p><strong>Payment Status:</strong> {order.payment_status.upper()}</p>
    </div>
    
    <p><strong>Estimated Delivery:</strong> {order.estimated_delivery} days</p>
    <p>Status: <strong>{order.status.upper()}</strong></p>
    """
    
    await send_email(to_email, subject, body)

async def send_order_status_email(to_email: str, order: Order):
    """Send order status update email"""
    subject = f"Order Update - {order.order_number}"
    body = f"""
    <h3>Order Status Updated</h3>
    <p>Your order <strong>{order.order_number}</strong> status has been updated to:</p>
    <h2 style="color: #4CAF50;">{order.status.upper()}</h2>
    <p>Total Amount: ₹{order.total_amount}</p>
    <p>Payment Status: {order.payment_status.upper()}</p>
    """
    await send_email(to_email, subject, body)
