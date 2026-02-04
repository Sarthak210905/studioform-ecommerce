from app.models.shipping_zone import ShippingZone
from typing import Optional
from app.core.config import settings

async def calculate_shipping_cost(
    pincode: str,
    state: str,
    subtotal: float,
    weight_kg: float = 1.0,
    payment_mode: str = 'Prepaid',
    cod_amount: float = 0.0
) -> dict:
    """
    Calculate shipping cost - Simple fixed pricing
    ₹150 flat rate, FREE above ₹1499
    """
    
    # Simple flat rate shipping
    if subtotal >= 1499:
        shipping_cost = 0.0
        free_shipping = True
    else:
        shipping_cost = 150.0
        free_shipping = False
    
    return {
        "shipping_cost": shipping_cost,
        "free_shipping": free_shipping,
        "zone_name": "Standard Shipping",
        "estimated_days": "3-7",
        "provider": "flat-rate"
    }
    zone = await ShippingZone.find_one(
        {"pincodes": pincode, "is_active": True}
    )
    
    # If not found, try by state
    if not zone:
        zone = await ShippingZone.find_one(
            {"states": state, "is_active": True}
        )
    
    # If still not found, use default zone
    if not zone:
        zone = await ShippingZone.find_one(
            {"name": "Default", "is_active": True}
        )
    
    # If no zones configured, use basic logic
    if not zone:
        if subtotal >= 1499:
            return {
                "shipping_cost": 0.0,
                "free_shipping": True,
                "zone_name": "Default",
                "estimated_days": "3-7"
            }
        else:
            return {
                "shipping_cost": 50.0,
                "free_shipping": False,
                "zone_name": "Default",
                "estimated_days": "3-7"
            }
    
    # Calculate shipping
    if subtotal >= zone.free_shipping_threshold:
        shipping_cost = 0.0
        free_shipping = True
    else:
        shipping_cost = zone.base_charge + (zone.charge_per_kg * weight_kg)
        free_shipping = False
    
    return {
        "shipping_cost": round(shipping_cost, 2),
        "free_shipping": free_shipping,
        "zone_name": zone.name,
        "estimated_days": f"{zone.estimated_days_min}-{zone.estimated_days_max}",
        "provider": "zone-based"
    }
