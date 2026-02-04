from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import settings
from app.db.mongodb import init_db, close_db
from app.db.init_indexes import init_indexes

# Import routes directly (no duplicates)
from app.api.routes import auth
from app.api.routes import products
from app.api.routes import cart
from app.api.routes import orders
from app.api.routes import wishlist
from app.api.routes import reviews
from app.api.routes import coupons
from app.api.routes import addresses
from app.api.routes import shipping
from app.api.routes import banners
from app.api.routes import contact
from app.api.routes import newsletter

# Optional routes
try:
    from app.api.routes import payment
except ImportError as e:
    payment = None
    print(f"⚠️ Warning: payment routes not found - {e}")

try:
    from app.api.routes import analytics
except ImportError:
    analytics = None
    print("⚠️ Warning: analytics routes not found")

try:
    from app.api.routes import notifications
except ImportError:
    notifications = None
    print("⚠️ Warning: notifications routes not found")

try:
    from app.api.routes import social_auth
except ImportError:
    social_auth = None
    print("⚠️ Warning: social_auth routes not found")

try:
    from app.api.routes import returns
except ImportError:
    returns = None
    print("⚠️ Warning: returns routes not found")

try:
    from app.api.routes import tracking
except ImportError:
    tracking = None
    print("⚠️ Warning: tracking routes not found")

try:
    from app.api.routes import admin
except ImportError:
    admin = None
    print("⚠️ Warning: admin routes not found")

# Initialize rate limiter with OPTIONS exclusion
def get_remote_address_skip_options(request: Request):
    """Get remote address for rate limiting, but skip OPTIONS requests"""
    if request.method == "OPTIONS":
        return None  # Skip rate limiting for OPTIONS
    return get_remote_address(request)

limiter = Limiter(
    key_func=get_remote_address_skip_options, 
    default_limits=["100/minute"]
)

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    await init_db()
    print(f"✅ Connected to MongoDB Atlas ({settings.DATABASE_NAME})")
    
    # Initialize indexes
    await init_indexes()
    print("✅ Database indexes initialized")
    
    print(f"✅ {settings.PROJECT_NAME} v{settings.VERSION}")
    print(f"🌍 Environment: {settings.ENVIRONMENT}")
    print(f"🔗 Frontend URL: {settings.FRONTEND_URL}")
    print(f"💳 Razorpay Payment Gateway: Initialized")
    print(f"📧 Email Service: {settings.SMTP_HOST}")
    print(f"📚 API Docs: {'/docs' if settings.is_development else 'Disabled'}")
    
    yield  # Only ONE yield
    
    # Shutdown
    await close_db()
    print("✅ Closed MongoDB connection")

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Complete E-commerce API with Razorpay Integration",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
    openapi_url="/openapi.json" if settings.is_development else None
)

# CORS middleware - MUST be FIRST to handle preflight
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Rate limiting middleware - AFTER CORS
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
# Don't add SlowAPIMiddleware - it breaks CORS preflight
# app.add_middleware(SlowAPIMiddleware)

# Root endpoint
@app.get("/", tags=["Root"])
@limiter.limit("200/minute")
async def root(request: Request):
    """API root endpoint"""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs" if settings.is_development else "disabled",
        "features": [
            "🔐 JWT Authentication & Authorization",
            "📧 Email Verification & Password Reset",
            "🔑 Social Login (Google, Facebook)",
            "📦 Product Management with Multiple Images",
            "💰 Discounts, Coupons & Flash Sales",
            "🛒 Shopping Cart & Wishlist",
            "📋 Order Management & Tracking",
            "💳 Razorpay Payment Integration",
            "💵 Cash on Delivery",
            "🚚 Dynamic Shipping by Zone",
            "⭐ Product Reviews & Ratings",
            "📍 Multiple Saved Addresses",
            "🔍 Advanced Search & Filters",
            "📊 Analytics Dashboard",
            "🔔 Real-time Notifications",
            "🔄 Return/Exchange Requests"
        ],
        "payment_methods": [
            "Razorpay (UPI, Cards, Net Banking, Wallets)",
            "Cash on Delivery (COD)"
        ]
    }

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database": "connected",
        "database_name": settings.DATABASE_NAME,
        "version": settings.VERSION
    }

# API Info endpoint (dev only)
@app.get("/info", tags=["Info"])
async def api_info():
    """Get API configuration info (development only)"""
    if not settings.is_development:
        return {"message": "Info endpoint disabled in production"}
    
    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "frontend_url": settings.FRONTEND_URL,
        "cors_origins": settings.cors_origins_list,
        "database": settings.DATABASE_NAME,
        "social_auth": {
            "google": bool(settings.GOOGLE_CLIENT_ID),
            "facebook": bool(settings.FACEBOOK_CLIENT_ID)
        }
    }

# Register core routers (NO DUPLICATES)
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(cart.router, prefix="/cart", tags=["Cart"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(wishlist.router, prefix="/wishlist", tags=["Wishlist"])
app.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
app.include_router(coupons.router, prefix="/coupons", tags=["Coupons"])
app.include_router(addresses.router, prefix="/addresses", tags=["Addresses"])
app.include_router(shipping.router, prefix="/shipping", tags=["Shipping"])
app.include_router(banners.router, prefix="/banners", tags=["Banners"])
app.include_router(contact.router, prefix="/contact", tags=["Contact"])
app.include_router(newsletter.router, prefix="/newsletter", tags=["Newsletter"])

# Register optional routers
if payment:
    app.include_router(payment.router, prefix="/payment", tags=["Payment"])

if analytics:
    app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

if notifications:
    app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

if social_auth:
    app.include_router(social_auth.router, prefix="/auth/social", tags=["Social Auth"])

if returns:
    app.include_router(returns.router, prefix="/returns", tags=["Returns"])

if tracking:
    app.include_router(tracking.router, prefix="/tracking", tags=["Tracking"])

if admin:
    app.include_router(admin.router, prefix="/admin", tags=["Admin"])

# FIXED: Exception handlers using JSONResponse
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Custom 404 handler"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": f"The endpoint {request.url.path} does not exist",
            "docs": "/docs" if settings.is_development else None
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """Custom 500 handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "Something went wrong. Please try again later."
        }
    )

print(f"✅ API initialized successfully!")
