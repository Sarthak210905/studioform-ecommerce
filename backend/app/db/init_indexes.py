"""Initialize database indexes for optimal performance"""

from app.models.product import Product
from app.models.order import Order
from app.models.user import User
from app.models.cart import CartItem
from app.models.wishlist import WishlistItem
from app.models.review import Review
from app.models.notification import Notification
from app.models.recently_viewed import RecentlyViewed
from app.models.return_request import ReturnRequest

async def init_indexes():
    """Create all database indexes"""
    
    print("📊 Creating database indexes...")
    
    try:
        # Product indexes (defined in Product.Settings.indexes)
        await Product.get_motor_collection().create_index("name")
        await Product.get_motor_collection().create_index("category")
        await Product.get_motor_collection().create_index([("name", "text"), ("description", "text")])
        
        # Order indexes
        await Order.get_motor_collection().create_index("user_id")
        await Order.get_motor_collection().create_index("order_number", unique=True)
        await Order.get_motor_collection().create_index([("user_id", 1), ("created_at", -1)])
        
        # User indexes
        await User.get_motor_collection().create_index("email", unique=True)
        await User.get_motor_collection().create_index("username", unique=True)
        
        # Cart indexes
        await CartItem.get_motor_collection().create_index([("user_id", 1), ("product_id", 1)])
        
        # Wishlist indexes
        await WishlistItem.get_motor_collection().create_index([("user_id", 1), ("product_id", 1)])
        
        # Review indexes
        await Review.get_motor_collection().create_index("product_id")
        await Review.get_motor_collection().create_index([("product_id", 1), ("created_at", -1)])
        
        # Notification indexes
        await Notification.get_motor_collection().create_index([("user_id", 1), ("created_at", -1)])
        
        # Recently viewed indexes
        await RecentlyViewed.get_motor_collection().create_index([("user_id", 1), ("viewed_at", -1)])
        
        # Return request indexes
        await ReturnRequest.get_motor_collection().create_index([("user_id", 1), ("created_at", -1)])
        
        print("✅ Database indexes created successfully!")
        
    except Exception as e:
        print(f"⚠️ Warning: Some indexes may already exist: {e}")
