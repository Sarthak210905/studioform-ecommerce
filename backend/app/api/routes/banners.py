from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.models.banner import HeroBanner
from app.services.auth import get_current_user

router = APIRouter()


# Pydantic schemas for request/response
class BannerCreate(BaseModel):
    name: str
    image_url: str
    title: str
    description: str
    position: int
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    is_active: bool = True


class BannerUpdate(BaseModel):
    name: Optional[str] = None
    image_url: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = None
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    is_active: Optional[bool] = None


@router.get("/hero")
async def get_hero_banners() -> List[dict]:
    """Get all active hero banners sorted by position"""
    banners = await HeroBanner.find({"is_active": True}).sort([("position", 1)]).to_list()
    # Convert to dict with id field for frontend
    return [
        {
            "id": str(banner.id),
            "name": banner.name,
            "image_url": banner.image_url,
            "title": banner.title,
            "description": banner.description,
            "position": banner.position,
            "cta_text": banner.cta_text,
            "cta_link": banner.cta_link,
            "is_active": banner.is_active,
        }
        for banner in banners
    ]


@router.get("/hero/{position}")
async def get_hero_banner(position: int) -> HeroBanner:
    """Get a specific banner by position"""
    banner = await HeroBanner.find_one(
        {"position": position, "is_active": True}
    )
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Banner at position {position} not found"
        )
    return banner


@router.post("/hero")
async def create_hero_banner(banner_data: BannerCreate, current_user = Depends(get_current_user)) -> HeroBanner:
    """Create a new hero banner (admin only)"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can create banners"
        )
    
    from datetime import datetime
    banner_dict = banner_data.dict()
    banner_dict['created_at'] = datetime.now()
    banner_dict['updated_at'] = datetime.now()
    
    banner = HeroBanner.model_construct(**banner_dict)
    await banner.insert()
    return banner


@router.put("/hero/{banner_id}")
async def update_hero_banner(banner_id: str, banner_data: BannerUpdate, current_user = Depends(get_current_user)) -> HeroBanner:
    """Update a hero banner (admin only)"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can update banners"
        )
    banner = await HeroBanner.get(banner_id)
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner not found"
        )
    
    update_data = banner_data.dict(exclude_unset=True)
    await banner.update({"$set": update_data})
    return banner


@router.delete("/hero/{banner_id}")
async def delete_hero_banner(banner_id: str, current_user = Depends(get_current_user)) -> dict:
    """Delete a hero banner (admin only)"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can delete banners"
        )
    banner = await HeroBanner.get(banner_id)
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner not found"
        )
    await banner.delete()
    return {"message": "Banner deleted successfully"}
