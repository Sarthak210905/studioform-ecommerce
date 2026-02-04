from pydantic import BaseModel, EmailStr

class RequestPasswordReset(BaseModel):
    email: EmailStr

class VerifyOTP(BaseModel):
    email: EmailStr
    otp_code: str

class ResetPassword(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str
