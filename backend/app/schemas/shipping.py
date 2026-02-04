from pydantic import BaseModel
from typing import Optional

class ShippingZoneCreate(BaseModel):
    name: str
    pincodes: list[str] = []
    states: list[str] = []
    base_charge: float = 0.0
    charge_per_kg: float = 0.0
    free_shipping_threshold: float = 1499.0
    estimated_days_min: int = 3
    estimated_days_max: int = 7

class ShippingZoneResponse(BaseModel):
    id: str
    name: str
    base_charge: float
    free_shipping_threshold: float
    estimated_days_min: int
    estimated_days_max: int
    
    class Config:
        from_attributes = True

class CalculateShipping(BaseModel):
    pincode: str
    state: str
    subtotal: float
    weight_kg: float = 1.0
    payment_mode: str = 'Prepaid'  # 'Prepaid' or 'COD'
    cod_amount: float = 0.0  # COD collection amount
