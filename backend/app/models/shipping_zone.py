from beanie import Document
from pydantic import Field
from typing import List

class ShippingZone(Document):
    name: str  # e.g., "Metro Cities", "North Zone", "Remote Areas"
    pincodes: List[str] = []  # List of pincodes
    states: List[str] = []  # List of states
    
    # Charges
    base_charge: float = 0.0
    charge_per_kg: float = 0.0
    free_shipping_threshold: float = 1499.0  # Free shipping above this amount
    
    # Delivery time
    estimated_days_min: int = 3
    estimated_days_max: int = 7
    
    is_active: bool = True
    
    class Settings:
        name = "shipping_zones"
