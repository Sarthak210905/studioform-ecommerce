from pydantic_settings import BaseSettings
from typing import Optional, List
import os

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"
    
    # App Info
    PROJECT_NAME: str = "Premium Desktop Accessories API"
    VERSION: str = "1.0.0"
    
    # Database
    MONGODB_URL: str
    DATABASE_NAME: str = "webpage"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Email (FIXED FIELD NAMES)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str  # Changed from SMTP_USERNAME
    SMTP_PASSWORD: str
    EMAIL_FROM: str  # Changed from SMTP_FROM_EMAIL
    ADMIN_EMAIL: str  # Email to receive contact form submissions
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    
    # Razorpay
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None
    RAZORPAY_WEBHOOK_SECRET: Optional[str] = None
    
    # Delhivery
    DELHIVERY_API_KEY: Optional[str] = None
    DELHIVERY_API_URL: str = "https://track.delhivery.com/api"
    DELHIVERY_SURFACE_KEY: Optional[str] = None  # For surface shipping
    DELHIVERY_10KG_SURFACE_KEY: Optional[str] = None  # For 10kg+ surface
    DELHIVERY_ENABLED: bool = False
    
    # Warehouse (for Delhivery)
    WAREHOUSE_NAME: str = "Main Warehouse"
    WAREHOUSE_ADDRESS: str = "Indore, Madhya Pradesh"
    WAREHOUSE_PINCODE: str = "452001"
    WAREHOUSE_CITY: str = "Indore"
    WAREHOUSE_STATE: str = "Madhya Pradesh"
    WAREHOUSE_PHONE: str = ""
    
    # Redis
    USE_REDIS: bool = False  # ✅ ADD THIS LINE
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    
    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"
    
    # CORS Origins - Support both variable names
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    ALLOWED_ORIGINS: Optional[str] = None  # Alternative variable name
    
    # Social Auth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"
    
    FACEBOOK_CLIENT_ID: Optional[str] = None
    FACEBOOK_CLIENT_SECRET: Optional[str] = None
    FACEBOOK_REDIRECT_URI: str = "http://localhost:8000/auth/facebook/callback"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS or ALLOWED_ORIGINS string to list"""
        origins = self.ALLOWED_ORIGINS if self.ALLOWED_ORIGINS else self.CORS_ORIGINS
        return [origin.strip() for origin in origins.split(",")]
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.ENVIRONMENT == "development"

settings = Settings()
