from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.newsletter import NewsletterSubscriber

router = APIRouter()

# Request Schema
class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr


# Response Schema
class NewsletterSubscribeResponse(BaseModel):
    message: str
    email: str


@router.post("/subscribe", response_model=NewsletterSubscribeResponse)
async def subscribe_to_newsletter(request: NewsletterSubscribeRequest):
    """Subscribe to newsletter"""
    try:
        # Check if email already exists
        existing = await NewsletterSubscriber.find_one(
            NewsletterSubscriber.email == request.email
        )
        
        if existing:
            if existing.is_active:
                raise HTTPException(
                    status_code=400,
                    detail="This email is already subscribed to our newsletter"
                )
            else:
                # Reactivate subscription
                existing.is_active = True
                existing.subscribed_at = datetime.utcnow()
                await existing.save()
                return NewsletterSubscribeResponse(
                    message="Welcome back! Your subscription has been reactivated.",
                    email=request.email
                )
        
        # Create new subscriber
        subscriber = NewsletterSubscriber(
            email=request.email,
            subscribed_at=datetime.utcnow(),
            is_active=True
        )
        await subscriber.insert()
        
        return NewsletterSubscribeResponse(
            message="Thank you for subscribing to our newsletter!",
            email=request.email
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/unsubscribe")
async def unsubscribe_from_newsletter(request: NewsletterSubscribeRequest):
    """Unsubscribe from newsletter"""
    try:
        subscriber = await NewsletterSubscriber.find_one(
            NewsletterSubscriber.email == request.email
        )
        
        if not subscriber:
            raise HTTPException(status_code=404, detail="Email not found in our newsletter list")
        
        subscriber.is_active = False
        await subscriber.save()
        
        return {"message": "You have been successfully unsubscribed"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
