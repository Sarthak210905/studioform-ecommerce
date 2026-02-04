import random
from datetime import datetime, timedelta
from typing import Optional
from app.models.otp import OTP

def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))

async def create_otp(email: str, purpose: str = "password_reset") -> str:
    """Create and store OTP"""
    # Invalidate old OTPs for this email and purpose
    old_otps = await OTP.find(
        OTP.email == email,
        OTP.purpose == purpose,
        OTP.is_used == False
    ).to_list()
    
    for old_otp in old_otps:
        old_otp.is_used = True
        await old_otp.save()
    
    # Generate new OTP
    otp_code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    otp = OTP(
        email=email,
        otp_code=otp_code,
        purpose=purpose,
        expires_at=expires_at
    )
    await otp.insert()
    
    return otp_code

async def verify_otp(email: str, otp_code: str, purpose: str = "password_reset") -> Optional[OTP]:
    """Verify OTP code"""
    otp = await OTP.find_one(
        OTP.email == email,
        OTP.otp_code == otp_code,
        OTP.purpose == purpose,
        OTP.is_used == False
    )
    
    if not otp:
        return None
    
    if not otp.is_valid():
        return None
    
    return otp

async def mark_otp_used(otp: OTP):
    """Mark OTP as used"""
    otp.is_used = True
    await otp.save()
