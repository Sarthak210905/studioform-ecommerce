from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import settings
from app.models.user import User
from app.models.product import Product
from app.models.cart import CartItem
from app.models.order import Order
from app.models.wishlist import WishlistItem
from app.models.review import Review
from app.models.coupon import Coupon
from app.models.address import Address
from app.models.notification import Notification
from app.models.recently_viewed import RecentlyViewed
from app.models.return_request import ReturnRequest
from app.models.shipping_zone import ShippingZone
from app.models.banner import HeroBanner
from app.models.newsletter import NewsletterSubscriber
from app.models.contact import ContactSubmission

# MongoDB client
client = None

async def init_db():
    """Initialize database connection"""
    global client
    
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    database = client[settings.DATABASE_NAME]
    
    # Initialize Beanie with all document models
    await init_beanie(
        database=database,
        document_models=[
            User,
            Product,
            CartItem,
            Order,
            WishlistItem,
            Review,
            Coupon,
            Address,
            Notification,
            RecentlyViewed,
            ReturnRequest,
            ShippingZone,
            HeroBanner,
            ContactSubmission,
            NewsletterSubscriber,
        ]
    )

async def close_db():
    """Close database connection"""
    global client
    if client:
        client.close()
