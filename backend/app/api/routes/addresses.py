from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId

from app.models.address import Address
from app.models.user import User
from app.schemas.address import AddressCreate, AddressUpdate, AddressResponse
from app.services.auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[AddressResponse])
async def get_addresses(current_user: User = Depends(get_current_active_user)):
    """Get all saved addresses"""
    
    addresses = await Address.find(
        Address.user_id == str(current_user.id)
    ).sort(-Address.is_default).to_list()
    
    return [
        AddressResponse(
            id=str(addr.id),
            label=addr.label,
            full_name=addr.full_name,
            phone=addr.phone,
            address_line1=addr.address_line1,
            address_line2=addr.address_line2,
            city=addr.city,
            state=addr.state,
            pincode=addr.pincode,
            country=addr.country,
            is_default=addr.is_default
        )
        for addr in addresses
    ]

@router.post("/", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
async def create_address(
    address_data: AddressCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Add new address"""
    
    # If this is set as default, unset other defaults
    if address_data.is_default:
        existing_addresses = await Address.find(
            Address.user_id == str(current_user.id),
            Address.is_default == True
        ).to_list()
        
        for addr in existing_addresses:
            addr.is_default = False
            await addr.save()
    
    # Create address
    address = Address(
        user_id=str(current_user.id),
        **address_data.model_dump()
    )
    await address.insert()
    
    return AddressResponse(
        id=str(address.id),
        label=address.label,
        full_name=address.full_name,
        phone=address.phone,
        address_line1=address.address_line1,
        address_line2=address.address_line2,
        city=address.city,
        state=address.state,
        pincode=address.pincode,
        country=address.country,
        is_default=address.is_default
    )

@router.get("/{address_id}", response_model=AddressResponse)
async def get_address(
    address_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get single address"""
    
    try:
        address = await Address.get(PydanticObjectId(address_id))
        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid address ID"
        )
    
    # Verify ownership
    if address.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this address"
        )
    
    return AddressResponse(
        id=str(address.id),
        label=address.label,
        full_name=address.full_name,
        phone=address.phone,
        address_line1=address.address_line1,
        address_line2=address.address_line2,
        city=address.city,
        state=address.state,
        pincode=address.pincode,
        country=address.country,
        is_default=address.is_default
    )

@router.put("/{address_id}", response_model=AddressResponse)
async def update_address(
    address_id: str,
    address_data: AddressUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update address"""
    
    try:
        address = await Address.get(PydanticObjectId(address_id))
        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid address ID"
        )
    
    # Verify ownership
    if address.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this address"
        )
    
    # If setting as default, unset other defaults
    if address_data.is_default:
        existing_addresses = await Address.find(
            Address.user_id == str(current_user.id),
            Address.is_default == True
        ).to_list()
        
        for addr in existing_addresses:
            if str(addr.id) != address_id:
                addr.is_default = False
                await addr.save()
    
    # Update fields
    update_data = address_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(address, field, value)
    
    await address.save()
    
    return AddressResponse(
        id=str(address.id),
        label=address.label,
        full_name=address.full_name,
        phone=address.phone,
        address_line1=address.address_line1,
        address_line2=address.address_line2,
        city=address.city,
        state=address.state,
        pincode=address.pincode,
        country=address.country,
        is_default=address.is_default
    )

@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    address_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete address"""
    
    try:
        address = await Address.get(PydanticObjectId(address_id))
        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid address ID"
        )
    
    # Verify ownership
    if address.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this address"
        )
    
    await address.delete()

@router.put("/{address_id}/set-default", response_model=AddressResponse)
async def set_default_address(
    address_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Set address as default"""
    
    try:
        address = await Address.get(PydanticObjectId(address_id))
        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid address ID"
        )
    
    # Verify ownership
    if address.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this address"
        )
    
    # Unset other defaults
    existing_addresses = await Address.find(
        Address.user_id == str(current_user.id),
        Address.is_default == True
    ).to_list()
    
    for addr in existing_addresses:
        addr.is_default = False
        await addr.save()
    
    # Set this as default
    address.is_default = True
    await address.save()
    
    return AddressResponse(
        id=str(address.id),
        label=address.label,
        full_name=address.full_name,
        phone=address.phone,
        address_line1=address.address_line1,
        address_line2=address.address_line2,
        city=address.city,
        state=address.state,
        pincode=address.pincode,
        country=address.country,
        is_default=address.is_default
    )
