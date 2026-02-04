import asyncio
from motor import motor_asyncio
from beanie import init_beanie
from app.models.product import Product
from app.core.config import settings

async def add_sample_products():
    """Add sample products to MongoDB Atlas"""
    # Connect to MongoDB
    client = motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
    database = client[settings.DATABASE_NAME]
    
    # Initialize Beanie
    await init_beanie(database=database, document_models=[Product])
    
    # Sample products
    products = [
        Product(
            name="Premium Micropad",
            description="Ultra-smooth gaming micropad with precision surface",
            price=2499.00,
            category="Mouse Pads",
            stock=50
        ),
        Product(
            name="7-Segment Desk Clock",
            description="Modern minimalist desk clock with LED display",
            price=1999.00,
            category="Desk Accessories",
            stock=30
        ),
        Product(
            name="Wooden Desk Organizer",
            description="Handcrafted premium wooden desk organizer",
            price=1499.00,
            category="Desk Accessories",
            stock=40
        ),
    ]
    
    for product in products:
        await product.insert()
    
    print("✓ Sample products added to MongoDB Atlas!")
    client.close()

if __name__ == "__main__":
    asyncio.run(add_sample_products())
