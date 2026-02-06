from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from beanie import PydanticObjectId
from datetime import datetime
from typing import Optional

from app.models.order import Order
from app.models.user import User
from app.models.product import Product
from app.models.cart import CartItem
from app.schemas.payment import CreateRazorpayOrder, VerifyPayment, RazorpayOrderResponse
from app.services.auth import get_current_active_user
from app.services.razorpay_service import (
    create_razorpay_order,
    verify_razorpay_payment,
    verify_razorpay_webhook,
    fetch_payment_details,
    create_refund
)
from app.services.email import send_email

router = APIRouter()

@router.post("/create-order", response_model=RazorpayOrderResponse)
async def create_payment_order(
    payment_data: CreateRazorpayOrder,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create Razorpay order for an existing order
    """
    
    # Get order
    try:
        order = await Order.get(PydanticObjectId(payment_data.order_id))
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
    except Exception as e:
        print(f"Error fetching order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid order ID: {str(e)}"
        )
    
    # Verify ownership
    if order.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Check if already paid
    if order.payment_status == "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order already paid"
        )
    
    # Create Razorpay order
    # Safely get phone from shipping address
    phone = ""
    if isinstance(order.shipping_address, dict):
        phone = order.shipping_address.get("phone", "")
    
    try:
        result = create_razorpay_order(
            amount=order.total_amount,
            order_id=order.order_number,
            customer_email=current_user.email,
            customer_phone=phone
        )
    except Exception as e:
        print(f"Error creating Razorpay order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create Razorpay order: {str(e)}"
        )
    
    if not result["success"]:
        print(f"Razorpay order creation failed: {result.get('error')}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment order: {result.get('error')}"
        )
    
    # Update order with Razorpay order ID
    order.payment_id = result["razorpay_order_id"]
    order.payment_method = "razorpay"
    await order.save()
    
    return RazorpayOrderResponse(
        razorpay_order_id=result["razorpay_order_id"],
        amount=result["amount"],
        currency=result["currency"],
        key_id=result["key_id"]
    )

@router.post("/verify-payment")
async def verify_payment(
    payment_data: VerifyPayment,
    current_user: User = Depends(get_current_active_user)
):
    """
    Verify Razorpay payment signature
    """
    
    # Get order
    try:
        order = await Order.get(PydanticObjectId(payment_data.order_id))
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
            detail="Not authorized"
        )
    
    # Verify payment signature
    is_valid = verify_razorpay_payment(
        payment_data.razorpay_order_id,
        payment_data.razorpay_payment_id,
        payment_data.razorpay_signature
    )
    
    if not is_valid:
        # Mark as failed
        order.payment_status = "failed"
        await order.save()
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature"
        )
    
    # Payment verified - update order
    order.payment_status = "paid"
    order.payment_id = payment_data.razorpay_payment_id
    order.status = "processing"
    order.updated_at = datetime.utcnow()
    await order.save()
    
    # Update product stock
    for order_item in order.items:
        try:
            product = await Product.get(PydanticObjectId(order_item.product_id))
            if product:
                product.stock -= order_item.quantity
                await product.save()
        except Exception as e:
            print(f"Error updating stock for product {order_item.product_id}: {e}")
    
    # Clear user's cart
    try:
        cart_items = await CartItem.find(
            CartItem.user_id == str(current_user.id)
        ).to_list()
        for cart_item in cart_items:
            await cart_item.delete()
    except Exception as e:
        print(f"Error clearing cart: {e}")
    
    # Send payment confirmation email
    await send_payment_confirmation_email(current_user.email, order)
    
    return {
        "success": True,
        "message": "Payment verified successfully",
        "order_id": str(order.id),
        "order_number": order.order_number,
        "payment_status": order.payment_status
    }

@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None)
):
    """
    Handle Razorpay webhooks
    """
    
    payload = await request.body()
    
    # Verify webhook signature
    if not verify_razorpay_webhook(payload, x_razorpay_signature):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature"
        )
    
    # Parse payload
    data = await request.json()
    event = data.get("event")
    payment_entity = data.get("payload", {}).get("payment", {}).get("entity", {})
    
    # Handle different events
    if event == "payment.captured":
        # Payment successful
        order_receipt = payment_entity.get("notes", {}).get("order_id")
        payment_id = payment_entity.get("id")
        
        # Find and update order
        order = await Order.find_one(Order.order_number == order_receipt)
        if order:
            order.payment_status = "paid"
            order.payment_id = payment_id
            order.status = "processing"
            order.updated_at = datetime.utcnow()
            await order.save()
    
    elif event == "payment.failed":
        # Payment failed
        order_receipt = payment_entity.get("notes", {}).get("order_id")
        
        order = await Order.find_one(Order.order_number == order_receipt)
        if order:
            order.payment_status = "failed"
            order.updated_at = datetime.utcnow()
            await order.save()
    
    return {"status": "ok"}

@router.post("/refund/{order_id}")
async def initiate_refund(
    order_id: str,
    amount: Optional[float] = None,
    current_user: User = Depends(get_current_active_user)
):
    """
    Initiate refund for an order
    Admin only or order owner can request
    """
    
    # Get order
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
    
    # Verify authorization
    if order.user_id != str(current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Check if payment was made
    if order.payment_status != "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order not paid yet"
        )
    
    if not order.payment_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No payment ID found"
        )
    
    # Create refund
    result = create_refund(order.payment_id, amount)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create refund: {result.get('error')}"
        )
    
    # Update order
    order.payment_status = "refunded"
    order.status = "cancelled"
    order.updated_at = datetime.utcnow()
    await order.save()
    
    return {
        "success": True,
        "message": "Refund initiated successfully",
        "refund_id": result["refund_id"],
        "amount": result["amount"],
        "status": result["status"]
    }

async def send_payment_confirmation_email(to_email: str, order: Order):
    """Send payment confirmation email"""
    subject = f"Payment Confirmed - {order.order_number}"
    body = f"""
    <h3 style="color: #4CAF50;">Payment Successful!</h3>
    <p>Your payment has been confirmed for order <strong>{order.order_number}</strong></p>
    <p><strong>Amount Paid:</strong> ₹{order.total_amount}</p>
    <p><strong>Payment ID:</strong> {order.payment_id}</p>
    <p>Your order is now being processed and will be shipped soon.</p>
    """
    await send_email(to_email, subject, body)
