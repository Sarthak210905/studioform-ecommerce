import razorpay
import hmac
import hashlib
from app.core.config import settings

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

def create_razorpay_order(amount: float, order_id: str, customer_email: str, customer_phone: str) -> dict:
    """
    Create Razorpay order
    Amount should be in rupees (will be converted to paise)
    """
    
    amount_in_paise = int(amount * 100)  # Convert rupees to paise
    
    order_data = {
        "amount": amount_in_paise,
        "currency": "INR",
        "receipt": order_id,
        "notes": {
            "order_id": order_id,
            "customer_email": customer_email,
            "customer_phone": customer_phone
        }
    }
    
    try:
        razorpay_order = razorpay_client.order.create(data=order_data)
        return {
            "success": True,
            "razorpay_order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"],
            "key_id": settings.RAZORPAY_KEY_ID
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def verify_razorpay_payment(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    """
    Verify Razorpay payment signature
    """
    
    try:
        # Generate signature
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        generated_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Compare signatures
        return hmac.compare_digest(generated_signature, razorpay_signature)
    except Exception as e:
        print(f"Payment verification error: {e}")
        return False

def verify_razorpay_webhook(payload: dict, signature: str) -> bool:
    """
    Verify Razorpay webhook signature
    """
    
    try:
        razorpay_client.utility.verify_webhook_signature(
            payload,
            signature,
            settings.RAZORPAY_WEBHOOK_SECRET
        )
        return True
    except:
        return False

def fetch_payment_details(payment_id: str) -> dict:
    """
    Fetch payment details from Razorpay
    """
    
    try:
        payment = razorpay_client.payment.fetch(payment_id)
        return {
            "success": True,
            "payment": payment
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def create_refund(payment_id: str, amount: float = None) -> dict:
    """
    Create refund for a payment
    If amount is None, full refund is initiated
    """
    
    try:
        refund_data = {}
        if amount:
            refund_data["amount"] = int(amount * 100)  # Convert to paise
        
        refund = razorpay_client.payment.refund(payment_id, refund_data)
        return {
            "success": True,
            "refund_id": refund["id"],
            "amount": refund["amount"] / 100,  # Convert back to rupees
            "status": refund["status"]
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
