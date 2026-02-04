import random
import string
from datetime import datetime
from typing import Optional

def generate_order_number() -> str:
    """Generate unique order number - Shorter format"""
    # Use only date (YYMMDD) instead of full timestamp
    date_str = datetime.utcnow().strftime("%y%m%d")
    # Use 4 random chars instead of 6
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"ORD{date_str}{random_str}"

def calculate_order_totals(subtotal: float) -> dict:
    """Calculate shipping, platform fee and total"""
    # Free shipping above 1499
    shipping_cost = 0.0 if subtotal >= 1499 else 150.0
    
    # 2% platform fee
    platform_fee = round(subtotal * 0.02, 2)
    
    total_amount = round(subtotal + shipping_cost + platform_fee, 2)
    
    return {
        "shipping_cost": shipping_cost,
        "tax": platform_fee,
        "total_amount": total_amount
    }

