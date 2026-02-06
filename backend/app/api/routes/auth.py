from datetime import timedelta, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks, Body
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional
import secrets
from html import escape as html_escape
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate, ChangePassword
from app.schemas.token import Token
from app.services.auth import (
    authenticate_user,
    get_user_by_username,
    get_user_by_email,
    get_current_active_user
)
from app.services.email import send_email
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Request body models for sensitive operations
class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)

class DeleteAccountRequest(BaseModel):
    password: str

# ==================== REGISTRATION ====================

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
async def register(
    request: Request,
    user_in: UserCreate,
    background_tasks: BackgroundTasks
):
    """Register a new user with email verification"""
    
    # Check if user already exists
    if await get_user_by_email(user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if await get_user_by_username(user_in.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Generate verification token with expiry
    verification_token = secrets.token_urlsafe(32)
    
    # Create new user
    user = User(
        email=user_in.email,
        username=user_in.username,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        is_verified=False,
        verification_token=verification_token,
        verification_token_expires=datetime.now(timezone.utc) + timedelta(hours=24)
    )
    await user.insert()
    
    # Send verification email
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
    background_tasks.add_task(
        send_verification_email,
        user.email,
        user.full_name,
        verification_link
    )
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        is_active=user.is_active,
        is_verified=user.is_verified,
        is_superuser=user.is_superuser,
        auth_provider=user.auth_provider,
        created_at=user.created_at
    )

# ==================== EMAIL VERIFICATION ====================

@router.post("/verify-email")
async def verify_email(token: str):
    """Verify user email with token"""
    
    user = await User.find_one(User.verification_token == token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Verify user
    user.is_verified = True
    user.verification_token = None
    await user.save()
    
    return {"message": "Email verified successfully"}

@router.post("/resend-verification")
@limiter.limit("3/hour")
async def resend_verification(
    request: Request,
    email: str,
    background_tasks: BackgroundTasks
):
    """Resend verification email"""
    
    user = await get_user_by_email(email)
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If email exists, verification link will be sent"}
    
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Generate new token
    verification_token = secrets.token_urlsafe(32)
    user.verification_token = verification_token
    user.verification_token_expires = datetime.now(timezone.utc) + timedelta(hours=24)
    await user.save()
    
    # Send verification email
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
    background_tasks.add_task(
        send_verification_email,
        user.email,
        user.full_name,
        verification_link
    )
    
    return {"message": "Verification email sent"}

# ==================== LOGIN ====================

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """Login and get access token"""
    
    user = await authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if email is verified (optional, can be strict)
    # if not user.is_verified:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Email not verified. Please verify your email first."
    #     )
    
    # Update last login
    user.last_login = datetime.now(timezone.utc)
    await user.save()
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=str(user.id),
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            is_active=user.is_active,
            is_verified=user.is_verified,
            is_superuser=user.is_superuser,
            auth_provider=user.auth_provider,
            created_at=user.created_at
        )
    }

# ==================== PASSWORD RESET ====================

@router.post("/forgot-password")
@limiter.limit("3/hour")
async def forgot_password(
    request: Request,
    email: str,
    background_tasks: BackgroundTasks
):
    """Request password reset"""
    
    user = await get_user_by_email(email)
    
    # Don't reveal if email exists (security best practice)
    if not user:
        return {"message": "If email exists, password reset link will be sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    await user.save()
    
    # Send reset email
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    background_tasks.add_task(
        send_password_reset_email,
        user.email,
        user.full_name,
        reset_link
    )
    
    return {"message": "Password reset link sent to your email"}

@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    """Reset password with token"""
    
    user = await User.find_one(User.reset_token == body.token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Check if token is expired
    if user.reset_token_expires < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    
    # Update password
    user.hashed_password = get_password_hash(body.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    await user.save()
    
    return {"message": "Password reset successfully"}

# ==================== PROFILE ====================

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user info"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        is_superuser=current_user.is_superuser,
        auth_provider=current_user.auth_provider,
        created_at=current_user.created_at
    )

@router.put("/me", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update current user profile"""
    
    # Check if username is taken
    if user_update.username and user_update.username != current_user.username:
        existing = await get_user_by_username(user_update.username)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        current_user.username = user_update.username
    
    if user_update.full_name:
        current_user.full_name = user_update.full_name
    
    await current_user.save()
    
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        is_superuser=current_user.is_superuser,
        auth_provider=current_user.auth_provider,
        created_at=current_user.created_at
    )

@router.post("/change-password")
async def change_password(
    password_data: ChangePassword,
    current_user: User = Depends(get_current_active_user)
):
    """Change user password"""
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    await current_user.save()
    
    return {"message": "Password changed successfully"}

@router.delete("/me")
async def delete_account(
    body: DeleteAccountRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Delete user account"""
    
    # Verify password
    if not verify_password(body.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    # Soft delete (deactivate)
    current_user.is_active = False
    await current_user.save()
    
    # Or hard delete:
    # await current_user.delete()
    
    return {"message": "Account deleted successfully"}

# ==================== EMAIL HELPERS ====================

async def send_verification_email(to_email: str, full_name: str, verification_link: str):
    """Send email verification link"""
    safe_name = html_escape(full_name)
    subject = "Verify Your Email - StudioForm"
    body = f"""
    <h2>Welcome, {safe_name}!</h2>
    <p>Thank you for registering at StudioForm.</p>
    <p>Please verify your email address by clicking the link below:</p>
    <p>
        <a href="{verification_link}" 
           style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
        </a>
    </p>
    <p>Or copy and paste this link in your browser:</p>
    <p>{verification_link}</p>
    <p>This link will expire in 24 hours.</p>
    <br>
    <p>If you didn't create this account, please ignore this email.</p>
    """
    await send_email(to_email, subject, body)

async def send_password_reset_email(to_email: str, full_name: str, reset_link: str):
    """Send password reset link"""
    safe_name = html_escape(full_name)
    subject = "Reset Your Password - StudioForm"
    body = f"""
    <h2>Hello, {safe_name}</h2>
    <p>We received a request to reset your password.</p>
    <p>Click the link below to reset your password:</p>
    <p>
        <a href="{reset_link}" 
           style="background-color: #2196F3; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
        </a>
    </p>
    <p>Or copy and paste this link in your browser:</p>
    <p>{reset_link}</p>
    <p><strong>This link will expire in 1 hour.</strong></p>
    <br>
    <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    """
    await send_email(to_email, subject, body)
