from fastapi import APIRouter, HTTPException, status
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
import httpx

from app.models.user import User
from app.core.config import settings
from app.core.security import create_access_token  # FIXED: Import from core.security

router = APIRouter()

# Initialize OAuth
oauth = OAuth()

# Register Google OAuth
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID or "dummy",
    client_secret=settings.GOOGLE_CLIENT_SECRET or "dummy",
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

# Register Facebook OAuth
oauth.register(
    name='facebook',
    client_id=settings.FACEBOOK_CLIENT_ID or "dummy",
    client_secret=settings.FACEBOOK_CLIENT_SECRET or "dummy",
    authorize_url='https://www.facebook.com/v12.0/dialog/oauth',
    access_token_url='https://graph.facebook.com/v12.0/oauth/access_token',
    client_kwargs={'scope': 'email public_profile'}
)

@router.get("/google/login")
async def google_login(request: Request):
    """Redirect to Google OAuth"""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth not configured"
        )
    
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request):
    """Google OAuth callback"""
    
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth not configured"
        )
    
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info")
        
        # Check if user exists
        user = await User.find_one(User.email == user_info['email'])
        
        if not user:
            # Create new user
            user = User(
                email=user_info['email'],
                username=user_info['email'].split('@')[0],  # Generate username from email
                full_name=user_info.get('name', ''),
                hashed_password="",  # No password for social login
                is_verified=True,  # Auto-verify social login
                auth_provider="google"
            )
            await user.insert()
        
        # Generate JWT token
        access_token = create_access_token(data={"sub": user.username})
        
        # Redirect to frontend with token
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/auth/callback?token={access_token}"
        )
        
    except Exception as e:
        print(f"Google OAuth error: {e}")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=google_oauth_failed"
        )

@router.get("/facebook/login")
async def facebook_login(request: Request):
    """Redirect to Facebook OAuth"""
    if not settings.FACEBOOK_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Facebook OAuth not configured"
        )
    
    redirect_uri = settings.FACEBOOK_REDIRECT_URI
    return await oauth.facebook.authorize_redirect(request, redirect_uri)

@router.get("/facebook/callback")
async def facebook_callback(request: Request):
    """Facebook OAuth callback"""
    
    if not settings.FACEBOOK_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Facebook OAuth not configured"
        )
    
    try:
        token = await oauth.facebook.authorize_access_token(request)
        
        # Get user info from Facebook
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                'https://graph.facebook.com/me',
                params={'fields': 'id,name,email', 'access_token': token['access_token']}
            )
            user_info = resp.json()
        
        if not user_info.get('email'):
            raise HTTPException(status_code=400, detail="Email not provided by Facebook")
        
        # Check if user exists
        user = await User.find_one(User.email == user_info['email'])
        
        if not user:
            # Create new user
            user = User(
                email=user_info['email'],
                username=user_info['email'].split('@')[0],
                full_name=user_info.get('name', ''),
                hashed_password="",
                is_verified=True,
                auth_provider="facebook"
            )
            await user.insert()
        
        # Generate JWT token
        access_token = create_access_token(data={"sub": user.username})
        
        # Redirect to frontend with token
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/auth/callback?token={access_token}"
        )
        
    except Exception as e:
        print(f"Facebook OAuth error: {e}")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=facebook_oauth_failed"
        )
