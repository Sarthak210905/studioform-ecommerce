from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId
from typing import Optional
from fastapi.responses import Response

from app.models.order import Order
from app.models.user import User
from app.services.auth import get_current_active_user, get_current_superuser
from app.services.delhivery import delhivery_service
from app.core.config import settings
from pydantic import BaseModel

router = APIRouter()


class DelhiveryShipmentCreate(BaseModel):
    order_id: str


class PincodeCheck(BaseModel):
    pincode: str


@router.post("/check-serviceability")
async def check_pincode_serviceability(data: PincodeCheck):
    """Check if pincode is serviceable by Delhivery"""
    
    if not settings.DELHIVERY_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Delhivery integration is not enabled"
        )
    
    result = delhivery_service.check_serviceability(data.pincode)
    return result


@router.post("/create-shipment")
async def create_delhivery_shipment(
    data: DelhiveryShipmentCreate,
    current_user: User = Depends(get_current_superuser)
):
    """
    Create a Delhivery shipment for an order (Admin only)
    """
    
    if not settings.DELHIVERY_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Delhivery integration is not enabled"
        )
    
    # Get order
    try:
        order = await Order.get(PydanticObjectId(data.order_id))
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid order ID: {str(e)}"
        )
    
    # Check if shipment already created
    if hasattr(order, 'delhivery_waybill') and order.delhivery_waybill:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Shipment already created. Waybill: {order.delhivery_waybill}"
        )
    
    # Prepare shipment data
    shipping_addr = order.shipping_address
    
    # Calculate total weight (estimate 500g per item)
    total_weight = sum(item.quantity * 500 for item in order.items)
    
    shipment_data = {
        'shipments': [{
            'name': shipping_addr.get('full_name'),
            'add': f"{shipping_addr.get('address_line1')}, {shipping_addr.get('address_line2', '')}",
            'pin': shipping_addr.get('pincode'),
            'city': shipping_addr.get('city'),
            'state': shipping_addr.get('state'),
            'country': shipping_addr.get('country', 'India'),
            'phone': shipping_addr.get('phone'),
            'order': order.order_number,
            'payment_mode': 'COD' if order.payment_method == 'cod' else 'Prepaid',
            'return_pin': settings.WAREHOUSE_PINCODE,
            'return_city': settings.WAREHOUSE_CITY,
            'return_state': settings.WAREHOUSE_STATE,
            'return_country': 'India',
            'return_name': settings.WAREHOUSE_NAME,
            'return_add': settings.WAREHOUSE_ADDRESS,
            'return_phone': settings.WAREHOUSE_PHONE,
            'order_date': order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'total_amount': str(order.total_amount),
            'cod_amount': str(order.total_amount) if order.payment_method == 'cod' else '0.00',
            'weight': str(total_weight),
            'seller_name': settings.PROJECT_NAME,
            'quantity': str(sum(item.quantity for item in order.items)),
            'waybill': '',
            'shipment_width': '30',
            'shipment_height': '20',
            'shipping_mode': 'Surface',
            'address_type': 'home'
        }]
    }
    
    # Create shipment
    result = delhivery_service.create_shipment(shipment_data)
    
    if result.get('success'):
        # Update order with waybill
        order.delhivery_waybill = result.get('waybill')
        order.tracking_id = result.get('waybill')
        await order.save()
        
        return {
            'success': True,
            'waybill': result.get('waybill'),
            'message': 'Shipment created successfully'
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get('error', 'Failed to create shipment')
        )


@router.get("/track/{waybill}")
async def track_shipment(waybill: str):
    """Track a shipment by waybill number (Public)"""
    
    if not settings.DELHIVERY_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Delhivery integration is not enabled"
        )
    
    result = delhivery_service.track_shipment(waybill)
    
    if result.get('success'):
        return result
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get('error', 'Shipment not found')
        )


@router.get("/label/{waybill}")
async def download_label(
    waybill: str,
    current_user: User = Depends(get_current_active_user)
):
    """Download shipping label PDF"""
    
    if not settings.DELHIVERY_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Delhivery integration is not enabled"
        )
    
    pdf_content = delhivery_service.generate_label(waybill)
    
    if pdf_content:
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=label_{waybill}.pdf"
            }
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Label not found"
        )


@router.post("/cancel/{waybill}")
async def cancel_shipment(
    waybill: str,
    current_user: User = Depends(get_current_superuser)
):
    """Cancel a shipment (Admin only)"""
    
    if not settings.DELHIVERY_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Delhivery integration is not enabled"
        )
    
    result = delhivery_service.cancel_shipment(waybill)
    
    if result.get('success'):
        # Update order status
        order = await Order.find_one({"delhivery_waybill": waybill})
        if order:
            order.status = "cancelled"
            await order.save()
        
        return result
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get('error', 'Failed to cancel shipment')
        )


@router.get("/warehouses")
async def get_warehouses(current_user: User = Depends(get_current_superuser)):
    """Get list of registered warehouses"""
    
    if not settings.DELHIVERY_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Delhivery integration is not enabled"
        )
    
    warehouses = delhivery_service.get_warehouse_list()
    return warehouses
