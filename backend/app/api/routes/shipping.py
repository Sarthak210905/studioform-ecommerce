from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId

from app.models.shipping_zone import ShippingZone
from app.models.user import User
from app.schemas.shipping import ShippingZoneCreate, ShippingZoneResponse, CalculateShipping
from app.services.auth import get_current_active_user
from app.services.shipping import calculate_shipping_cost

router = APIRouter()

@router.post("/calculate")
async def calculate_shipping(shipping_data: CalculateShipping):
    """Calculate shipping cost (public)"""
    
    result = await calculate_shipping_cost(
        shipping_data.pincode,
        shipping_data.state,
        shipping_data.subtotal,
        shipping_data.weight_kg,
        shipping_data.payment_mode,
        shipping_data.cod_amount
    )
    
    return result

# Admin routes
@router.post("/admin/zones", response_model=ShippingZoneResponse, status_code=status.HTTP_201_CREATED)
async def create_shipping_zone(
    zone_data: ShippingZoneCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Create shipping zone"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    zone = ShippingZone(**zone_data.model_dump())
    await zone.insert()
    
    return ShippingZoneResponse(
        id=str(zone.id),
        name=zone.name,
        base_charge=zone.base_charge,
        free_shipping_threshold=zone.free_shipping_threshold,
        estimated_days_min=zone.estimated_days_min,
        estimated_days_max=zone.estimated_days_max
    )

@router.get("/admin/zones")
async def get_all_zones(current_user: User = Depends(get_current_active_user)):
    """Admin: Get all shipping zones"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    zones = await ShippingZone.find_all().to_list()
    # Convert to dict and ensure id is string
    return [
        {
            "id": str(zone.id),
            "name": zone.name,
            "pincodes": zone.pincodes,
            "states": zone.states,
            "base_charge": zone.base_charge,
            "charge_per_kg": zone.charge_per_kg,
            "free_shipping_threshold": zone.free_shipping_threshold,
            "estimated_days_min": zone.estimated_days_min,
            "estimated_days_max": zone.estimated_days_max,
            "is_active": zone.is_active
        }
        for zone in zones
    ]

@router.put("/admin/zones/{zone_id}", response_model=ShippingZoneResponse)
async def update_shipping_zone(
    zone_id: str,
    zone_data: ShippingZoneCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Update shipping zone"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    zone = await ShippingZone.get(PydanticObjectId(zone_id))
    if not zone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping zone not found"
        )
    
    # Update zone fields
    update_data = zone_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(zone, field, value)
    
    await zone.save()
    
    return ShippingZoneResponse(
        id=str(zone.id),
        name=zone.name,
        base_charge=zone.base_charge,
        free_shipping_threshold=zone.free_shipping_threshold,
        estimated_days_min=zone.estimated_days_min,
        estimated_days_max=zone.estimated_days_max
    )

@router.delete("/admin/zones/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shipping_zone(
    zone_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Delete shipping zone"""
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    zone = await ShippingZone.get(PydanticObjectId(zone_id))
    if not zone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping zone not found"
        )
    
    await zone.delete()
    return None
