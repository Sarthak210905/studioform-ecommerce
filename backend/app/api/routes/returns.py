from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
from beanie import PydanticObjectId
from datetime import datetime, timedelta

from app.models.return_request import ReturnRequest
from app.models.order import Order
from app.models.user import User
from app.schemas.return_request import (
    CreateReturnRequest, UpdateReturnStatus, 
    ReturnRequestResponse, ReturnRequestItem
)
from app.services.auth import get_current_active_user
from app.services.cloudinary import upload_image
from app.services.notification import create_notification

router = APIRouter()

@router.post("/", response_model=ReturnRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_return_request(
    request_data: CreateReturnRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Create return/exchange request"""
    
    # Verify order exists and belongs to user
    try:
        order = await Order.get(PydanticObjectId(request_data.order_id))
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
    except:
        raise HTTPException(status_code=400, detail="Invalid order ID")
    
    if order.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if order is delivered
    if order.status != "delivered":
        raise HTTPException(
            status_code=400, 
            detail="Can only request return/exchange for delivered orders"
        )
    
    # Check if within return window (7 days)
    delivery_date = order.updated_at  # Assuming updated_at is when delivered
    if datetime.utcnow() - delivery_date > timedelta(days=7):
        raise HTTPException(
            status_code=400,
            detail="Return/exchange window has expired (7 days from delivery)"
        )
    
    # Check if already has pending request
    existing = await ReturnRequest.find_one(
        ReturnRequest.order_id == request_data.order_id,
        ReturnRequest.status == "pending"
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A pending return/exchange request already exists for this order"
        )
    
    # Create return request
    return_request = ReturnRequest(
        user_id=str(current_user.id),
        order_id=request_data.order_id,
        order_number=order.order_number,
        request_type=request_data.request_type,
        reason=request_data.reason,
        items=[item.dict() for item in request_data.items],
        status="pending"
    )
    await return_request.insert()
    
    # Notify admin
    await create_notification(
        user_id="admin",  # Special admin user ID
        notification_type="return_request",
        title="New Return/Exchange Request",
        message=f"Order #{order.order_number} - {request_data.request_type}",
        link="/admin/returns"
    )
    
    return ReturnRequestResponse(
        id=str(return_request.id),
        user_id=return_request.user_id,
        order_id=return_request.order_id,
        order_number=return_request.order_number,
        request_type=return_request.request_type,
        reason=return_request.reason,
        items=[ReturnRequestItem(**item) for item in return_request.items],
        status=return_request.status,
        images=return_request.images,
        admin_notes=return_request.admin_notes,
        refund_amount=return_request.refund_amount,
        created_at=return_request.created_at,
        updated_at=return_request.updated_at
    )

@router.post("/{request_id}/images")
async def upload_return_images(
    request_id: str,
    images: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload proof images for return request"""
    
    try:
        return_request = await ReturnRequest.get(PydanticObjectId(request_id))
        if not return_request:
            raise HTTPException(status_code=404, detail="Return request not found")
    except:
        raise HTTPException(status_code=400, detail="Invalid request ID")
    
    if return_request.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if len(images) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed")
    
    uploaded_urls = []
    for image in images:
        if not image.content_type.startswith('image/'):
            continue
        
        file_content = await image.read()
        image_url = await upload_image(
            file_content,
            filename=f"return_{request_id}_{image.filename}",
            folder="premium-accessories/returns"
        )
        
        if image_url:
            uploaded_urls.append(image_url)
    
    return_request.images.extend(uploaded_urls)
    return_request.updated_at = datetime.utcnow()
    await return_request.save()
    
    return {"success": True, "uploaded": len(uploaded_urls)}

@router.get("/my-requests", response_model=List[ReturnRequestResponse])
async def get_my_return_requests(
    current_user: User = Depends(get_current_active_user)
):
    """Get user's return/exchange requests"""
    
    requests = await ReturnRequest.find(
        ReturnRequest.user_id == str(current_user.id)
    ).sort(-ReturnRequest.created_at).to_list()
    
    return [
        ReturnRequestResponse(
            id=str(req.id),
            user_id=req.user_id,
            order_id=req.order_id,
            order_number=req.order_number,
            request_type=req.request_type,
            reason=req.reason,
            items=[ReturnRequestItem(**item) for item in req.items],
            status=req.status,
            images=req.images,
            admin_notes=req.admin_notes,
            refund_amount=req.refund_amount,
            created_at=req.created_at,
            updated_at=req.updated_at
        )
        for req in requests
    ]

@router.get("/my-returns", response_model=List[ReturnRequestResponse])
async def get_my_return_requests_alias(
    current_user: User = Depends(get_current_active_user)
):
    """Alias for clients calling /returns/my-returns"""

    return await get_my_return_requests(current_user)

@router.get("/{request_id}", response_model=ReturnRequestResponse)
async def get_return_request(
    request_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get return request details"""
    
    try:
        return_request = await ReturnRequest.get(PydanticObjectId(request_id))
        if not return_request:
            raise HTTPException(status_code=404, detail="Return request not found")
    except:
        raise HTTPException(status_code=400, detail="Invalid request ID")
    
    # Verify ownership or admin
    if return_request.user_id != str(current_user.id) and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return ReturnRequestResponse(
        id=str(return_request.id),
        user_id=return_request.user_id,
        order_id=return_request.order_id,
        order_number=return_request.order_number,
        request_type=return_request.request_type,
        reason=return_request.reason,
        items=[ReturnRequestItem(**item) for item in return_request.items],
        status=return_request.status,
        images=return_request.images,
        admin_notes=return_request.admin_notes,
        refund_amount=return_request.refund_amount,
        created_at=return_request.created_at,
        updated_at=return_request.updated_at
    )

# Admin routes
@router.put("/{request_id}/status", response_model=ReturnRequestResponse)
async def update_return_status_shorthand(
    request_id: str,
    status_update: UpdateReturnStatus,
    current_user: User = Depends(get_current_active_user)
):
    """Update return/exchange request status (admin only)"""
    
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        return_request = await ReturnRequest.get(PydanticObjectId(request_id))
        if not return_request:
            raise HTTPException(status_code=404, detail="Return request not found")
    except:
        raise HTTPException(status_code=400, detail="Invalid request ID")
    
    return_request.status = status_update.status
    if status_update.admin_notes:
        return_request.admin_notes = status_update.admin_notes
    if status_update.refund_amount:
        return_request.refund_amount = status_update.refund_amount
    return_request.updated_at = datetime.utcnow()
    await return_request.save()
    
    # Notify user
    await create_notification(
        user_id=return_request.user_id,
        notification_type="return_update",
        title=f"Exchange Request {status_update.status.title()}",
        message=f"Your {return_request.request_type} request for order #{return_request.order_number} has been {status_update.status}",
        link="/returns"
    )
    
    return ReturnRequestResponse(
        id=str(return_request.id),
        user_id=return_request.user_id,
        order_id=return_request.order_id,
        order_number=return_request.order_number,
        request_type=return_request.request_type,
        reason=return_request.reason,
        items=[ReturnRequestItem(**item) for item in return_request.items],
        status=return_request.status,
        images=return_request.images,
        admin_notes=return_request.admin_notes,
        refund_amount=return_request.refund_amount,
        created_at=return_request.created_at,
        updated_at=return_request.updated_at
    )

@router.get("/admin/all", response_model=List[ReturnRequestResponse])
async def get_all_return_requests(
    status_filter: str = None,
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Get all return/exchange requests"""
    
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = ReturnRequest.find()
    
    if status_filter:
        query = query.find(ReturnRequest.status == status_filter)
    
    requests = await query.sort(-ReturnRequest.created_at).to_list()
    
    return [
        ReturnRequestResponse(
            id=str(req.id),
            user_id=req.user_id,
            order_id=req.order_id,
            order_number=req.order_number,
            request_type=req.request_type,
            reason=req.reason,
            items=[ReturnRequestItem(**item) for item in req.items],
            status=req.status,
            images=req.images,
            admin_notes=req.admin_notes,
            refund_amount=req.refund_amount,
            created_at=req.created_at,
            updated_at=req.updated_at
        )
        for req in requests
    ]

@router.put("/admin/{request_id}/status", response_model=ReturnRequestResponse)
async def update_return_status(
    request_id: str,
    status_update: UpdateReturnStatus,
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Update return/exchange request status"""
    
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        return_request = await ReturnRequest.get(PydanticObjectId(request_id))
        if not return_request:
            raise HTTPException(status_code=404, detail="Return request not found")
    except:
        raise HTTPException(status_code=400, detail="Invalid request ID")
    
    return_request.status = status_update.status
    if status_update.admin_notes:
        return_request.admin_notes = status_update.admin_notes
    if status_update.refund_amount:
        return_request.refund_amount = status_update.refund_amount
    return_request.updated_at = datetime.utcnow()
    await return_request.save()
    
    # Notify user
    await create_notification(
        user_id=return_request.user_id,
        notification_type="return_update",
        title=f"Return Request {status_update.status.title()}",
        message=f"Your {return_request.request_type} request for order #{return_request.order_number} has been {status_update.status}",
        link="/returns"
    )
    
    return ReturnRequestResponse(
        id=str(return_request.id),
        user_id=return_request.user_id,
        order_id=return_request.order_id,
        order_number=return_request.order_number,
        request_type=return_request.request_type,
        reason=return_request.reason,
        items=[ReturnRequestItem(**item) for item in return_request.items],
        status=return_request.status,
        images=return_request.images,
        admin_notes=return_request.admin_notes,
        refund_amount=return_request.refund_amount,
        created_at=return_request.created_at,
        updated_at=return_request.updated_at
    )
