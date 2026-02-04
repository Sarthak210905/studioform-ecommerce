from fastapi import APIRouter, HTTPException, status

from app.schemas.otp import RequestPasswordReset, VerifyOTP, ResetPassword
from app.services.auth import get_user_by_email
from app.services.otp import create_otp, verify_otp, mark_otp_used
from app.services.email import send_otp_email
from app.core.security import get_password_hash

router = APIRouter()

@router.post("/request-reset")
async def request_password_reset(request: RequestPasswordReset):
    """Request password reset - sends OTP to email"""
    
    # Check if user exists
    user = await get_user_by_email(request.email)
    if not user:
        # Don't reveal if user exists or not (security best practice)
        return {
            "message": "If the email exists, an OTP has been sent to it."
        }
    
    # Generate OTP
    otp_code = await create_otp(request.email, "password_reset")
    
    # Send email
    email_sent = await send_otp_email(request.email, otp_code)
    
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP email"
        )
    
    return {
        "message": "OTP has been sent to your email",
        "expires_in": "10 minutes"
    }

@router.post("/verify-otp")
async def verify_reset_otp(request: VerifyOTP):
    """Verify OTP code (optional step to check before resetting)"""
    
    otp = await verify_otp(request.email, request.otp_code, "password_reset")
    
    if not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    return {
        "message": "OTP verified successfully",
        "email": request.email
    }

@router.post("/reset-password")
async def reset_password(request: ResetPassword):
    """Reset password using OTP"""
    
    # Verify OTP
    otp = await verify_otp(request.email, request.otp_code, "password_reset")
    
    if not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    # Get user
    user = await get_user_by_email(request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.hashed_password = get_password_hash(request.new_password)
    await user.save()
    
    # Mark OTP as used
    await mark_otp_used(otp)
    
    return {
        "message": "Password reset successfully",
        "email": request.email
    }
