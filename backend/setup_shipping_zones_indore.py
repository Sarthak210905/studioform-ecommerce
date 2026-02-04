"""
Setup shipping zones for e-commerce shipping from Indore, Madhya Pradesh
Zones are configured based on distance and delivery logistics from Indore
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.models.shipping_zone import ShippingZone

async def setup_shipping_zones():
    # Connect to MongoDB
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    database = client[os.getenv("DATABASE_NAME", "webpage")]
    
    await init_beanie(database=database, document_models=[ShippingZone])
    
    # Clear existing zones
    await ShippingZone.find_all().delete()
    
    # Zone 1: Local - Madhya Pradesh (Same state as Indore)
    local_zone = ShippingZone(
        name="Madhya Pradesh (Local)",
        states=["Madhya Pradesh", "MP"],
        pincodes=[],
        base_charge=30.0,
        charge_per_kg=10.0,
        free_shipping_threshold=599.0,
        estimated_days_min=1,
        estimated_days_max=3,
        is_active=True
    )
    await local_zone.insert()
    print("✅ Created: Madhya Pradesh (Local) Zone")
    
    # Zone 2: Nearby States - Quick delivery from Indore
    nearby_zone = ShippingZone(
        name="Nearby States",
        states=[
            "Maharashtra", "Gujarat", "Rajasthan", 
            "Uttar Pradesh", "Chhattisgarh"
        ],
        pincodes=[],
        base_charge=50.0,
        charge_per_kg=15.0,
        free_shipping_threshold=999.0,
        estimated_days_min=2,
        estimated_days_max=4,
        is_active=True
    )
    await nearby_zone.insert()
    print("✅ Created: Nearby States Zone")
    
    # Zone 3: Metro Cities - Major cities with good connectivity
    metro_zone = ShippingZone(
        name="Metro Cities",
        states=["Delhi", "Karnataka", "West Bengal", "Tamil Nadu", "Telangana"],
        pincodes=[
            # Delhi NCR
            "110001", "110002", "110003", "110004", "110005",
            # Mumbai
            "400001", "400002", "400003", "400004", "400005",
            # Bangalore
            "560001", "560002", "560003", "560004", "560005",
            # Chennai
            "600001", "600002", "600003", "600004", "600005",
            # Hyderabad
            "500001", "500002", "500003", "500004", "500005",
            # Kolkata
            "700001", "700002", "700003", "700004", "700005"
        ],
        base_charge=60.0,
        charge_per_kg=20.0,
        free_shipping_threshold=1299.0,
        estimated_days_min=3,
        estimated_days_max=5,
        is_active=True
    )
    await metro_zone.insert()
    print("✅ Created: Metro Cities Zone")
    
    # Zone 4: North India
    north_zone = ShippingZone(
        name="North India",
        states=[
            "Punjab", "Haryana", "Himachal Pradesh", 
            "Uttarakhand", "Jammu and Kashmir"
        ],
        pincodes=[],
        base_charge=70.0,
        charge_per_kg=25.0,
        free_shipping_threshold=1499.0,
        estimated_days_min=4,
        estimated_days_max=6,
        is_active=True
    )
    await north_zone.insert()
    print("✅ Created: North India Zone")
    
    # Zone 5: East India
    east_zone = ShippingZone(
        name="East India",
        states=[
            "Bihar", "Jharkhand", "Odisha", 
            "Assam", "West Bengal"
        ],
        pincodes=[],
        base_charge=75.0,
        charge_per_kg=25.0,
        free_shipping_threshold=1499.0,
        estimated_days_min=4,
        estimated_days_max=7,
        is_active=True
    )
    await east_zone.insert()
    print("✅ Created: East India Zone")
    
    # Zone 6: South India
    south_zone = ShippingZone(
        name="South India",
        states=[
            "Andhra Pradesh", "Kerala", 
            "Puducherry", "Goa"
        ],
        pincodes=[],
        base_charge=80.0,
        charge_per_kg=30.0,
        free_shipping_threshold=1499.0,
        estimated_days_min=4,
        estimated_days_max=7,
        is_active=True
    )
    await south_zone.insert()
    print("✅ Created: South India Zone")
    
    # Zone 7: Northeast India - Farthest from Indore
    northeast_zone = ShippingZone(
        name="Northeast India",
        states=[
            "Arunachal Pradesh", "Manipur", "Meghalaya", 
            "Mizoram", "Nagaland", "Sikkim", "Tripura"
        ],
        pincodes=[],
        base_charge=100.0,
        charge_per_kg=40.0,
        free_shipping_threshold=1999.0,
        estimated_days_min=6,
        estimated_days_max=10,
        is_active=True
    )
    await northeast_zone.insert()
    print("✅ Created: Northeast India Zone")
    
    # Zone 8: Default - For any unmatched locations
    default_zone = ShippingZone(
        name="Default",
        states=[],
        pincodes=[],
        base_charge=50.0,
        charge_per_kg=20.0,
        free_shipping_threshold=999.0,
        estimated_days_min=3,
        estimated_days_max=7,
        is_active=True
    )
    await default_zone.insert()
    print("✅ Created: Default Zone")
    
    print("\n📦 Shipping Zones Summary (From Indore, MP):")
    print("=" * 70)
    
    zones = await ShippingZone.find_all().to_list()
    for zone in zones:
        print(f"\n{zone.name}:")
        print(f"  Base Charge: ₹{zone.base_charge}")
        print(f"  Per KG: ₹{zone.charge_per_kg}")
        print(f"  Free Shipping: Above ₹{zone.free_shipping_threshold}")
        print(f"  Delivery: {zone.estimated_days_min}-{zone.estimated_days_max} days")
        if zone.states:
            print(f"  States: {', '.join(zone.states[:3])}{'...' if len(zone.states) > 3 else ''}")
    
    client.close()

if __name__ == "__main__":
    print("🚚 Setting up shipping zones from Indore, Madhya Pradesh...")
    print("=" * 70)
    asyncio.run(setup_shipping_zones())
    print("\n✅ All shipping zones configured successfully!")
