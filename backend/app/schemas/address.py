from pydantic import BaseModel, Field
from typing import Optional

class AddressCreate(BaseModel):
    label: str = Field(..., max_length=50)
    full_name: str
    phone: str = Field(..., pattern=r"^\d{10}$")
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pincode: str = Field(..., pattern=r"^\d{6}$")
    country: str = "India"
    is_default: bool = False

class AddressUpdate(BaseModel):
    label: Optional[str] = Field(None, max_length=50)
    full_name: Optional[str] = None
    phone: Optional[str] = Field(None, pattern=r"^\d{10}$")
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = Field(None, pattern=r"^\d{6}$")
    country: Optional[str] = None
    is_default: Optional[bool] = None

class AddressResponse(BaseModel):
    id: str
    label: str
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str]
    city: str
    state: str
    pincode: str
    country: str
    is_default: bool
    
    class Config:
        from_attributes = True
