from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from beanie import PydanticObjectId

from app.models.notification import Notification
from app.models.user import User
from app.services.auth import get_current_active_user

router = APIRouter()

@router.get("/")
async def get_my_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_active_user)
):
    """Get user notifications"""
    
    query = Notification.find(Notification.user_id == str(current_user.id))
    
    if unread_only:
        query = query.find(Notification.is_read == False)
    
    notifications = await query.sort(-Notification.created_at).limit(50).to_list()
    
    # Serialize notifications with proper id field
    serialized_notifications = [
        {
            "id": str(notification.id),
            "user_id": notification.user_id,
            "type": notification.type,
            "title": notification.title,
            "message": notification.message,
            "action_url": notification.link,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat()
        }
        for notification in notifications
    ]
    
    return {
        "notifications": serialized_notifications,
        "unread_count": len([n for n in notifications if not n.is_read])
    }

@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Mark notification as read"""
    
    notification = await Notification.get(PydanticObjectId(notification_id))
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    notification.is_read = True
    await notification.save()
    
    return {"success": True}

@router.put("/mark-all-read")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_active_user)
):
    """Mark all notifications as read"""
    
    notifications = await Notification.find(
        Notification.user_id == str(current_user.id),
        Notification.is_read == False
    ).to_list()
    
    for notification in notifications:
        notification.is_read = True
        await notification.save()
    
    return {"success": True, "updated": len(notifications)}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete notification"""
    
    notification = await Notification.get(PydanticObjectId(notification_id))
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await notification.delete()
    
    return {"success": True}
