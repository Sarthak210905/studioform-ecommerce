"""
Add Special Edition themed desk accessories to the store.
Collections: Harry Potter, Marvel, DC Comics, Star Wars, Anime (Naruto/Dragon Ball)
"""
import asyncio
from motor import motor_asyncio
from beanie import init_beanie
from app.models.product import Product
from app.core.config import settings


SPECIAL_EDITION_PRODUCTS = [
    # ==================== HARRY POTTER EDITION ====================
    {
        "name": "Harry Potter Marauder's Map Desk Mat",
        "description": "Premium extended desk mat featuring the iconic Marauder's Map design. Water-resistant microfiber surface with anti-slip rubber base. The intricate map of Hogwarts covers the entire surface with magical footsteps that seem to move in the light. Perfect for wizards and Potterheads who want to bring the magic to their workspace. 'I solemnly swear that I am up to no good.'",
        "price": 2999.00,
        "category": "Desk Mats",
        "brand": "Studioform x Wizarding World",
        "images": [
            "https://images.unsplash.com/photo-1618944913480-b67ee16d7b77?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 30,
        "is_featured": True,
        "tags": ["Harry Potter Edition", "Special Edition", "Wizarding World", "Desk Mat", "Limited Edition"],
        "meta_title": "Harry Potter Marauder's Map Desk Mat - Special Edition",
        "meta_description": "Premium Marauder's Map desk mat for Harry Potter fans. Water-resistant, anti-slip, full-size desk coverage.",
        "slug": "harry-potter-marauders-map-desk-mat",
    },
    {
        "name": "Hogwarts House Crest Pen Holder Set",
        "description": "Elegant pen holder featuring all four Hogwarts house crests — Gryffindor, Slytherin, Ravenclaw, and Hufflepuff. Made from premium resin with gold-accented details. Includes four compartments, each adorned with a different house emblem. A must-have for any Harry Potter collector's desk.",
        "price": 1799.00,
        "category": "Desk Accessories",
        "brand": "Studioform x Wizarding World",
        "images": [
            "https://images.unsplash.com/photo-1553864250-05b20249ee0c?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 40,
        "is_featured": False,
        "tags": ["Harry Potter Edition", "Special Edition", "Hogwarts", "Pen Holder"],
        "meta_title": "Hogwarts House Crest Pen Holder - Harry Potter Special Edition",
        "meta_description": "Premium Hogwarts house crest pen holder set with Gryffindor, Slytherin, Ravenclaw & Hufflepuff designs.",
        "slug": "hogwarts-house-crest-pen-holder",
    },
    {
        "name": "Deathly Hallows LED Desk Lamp",
        "description": "Minimalist LED desk lamp shaped as the Deathly Hallows symbol. Features 3 brightness levels and warm/cool white modes. The triangle, circle, and line illuminate independently for a mesmerizing effect. USB-C powered with touch controls. Cast a spell of warm light across your workspace.",
        "price": 3499.00,
        "category": "Lighting",
        "brand": "Studioform x Wizarding World",
        "images": [
            "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 20,
        "is_featured": True,
        "tags": ["Harry Potter Edition", "Special Edition", "Deathly Hallows", "LED Lamp", "Lighting"],
        "meta_title": "Deathly Hallows LED Desk Lamp - Harry Potter Special Edition",
        "meta_description": "Deathly Hallows symbol LED desk lamp with 3 brightness levels. USB-C powered, touch controls.",
        "slug": "deathly-hallows-led-desk-lamp",
    },
    {
        "name": "Golden Snitch Wireless Charger",
        "description": "Charge your device with a touch of magic! This Golden Snitch-inspired wireless charger features detailed metallic wings that fold out to reveal the Qi charging pad. Supports 15W fast charging. Premium zinc alloy construction with a weighted base. Compatible with all Qi-enabled devices.",
        "price": 2499.00,
        "category": "Tech Accessories",
        "brand": "Studioform x Wizarding World",
        "images": [
            "https://images.unsplash.com/photo-1586953208270-767889fa9b0e?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 25,
        "is_featured": False,
        "tags": ["Harry Potter Edition", "Special Edition", "Golden Snitch", "Wireless Charger", "Tech"],
        "meta_title": "Golden Snitch Wireless Charger - Harry Potter Special Edition",
        "meta_description": "Golden Snitch wireless Qi charger with 15W fast charging. Zinc alloy with folding wings design.",
        "slug": "golden-snitch-wireless-charger",
    },

    # ==================== MARVEL EDITION ====================
    {
        "name": "Iron Man Arc Reactor Desk Lamp",
        "description": "The iconic Arc Reactor brought to your desk. This premium LED desk lamp replicates Tony Stark's chest piece in stunning detail. Features pulsing blue-white LED with 5 brightness modes, ambient glow effect, and a magnetic levitation base. USB-C powered. 'I am Iron Man.'",
        "price": 3999.00,
        "category": "Lighting",
        "brand": "Studioform x Marvel",
        "images": [
            "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 20,
        "is_featured": True,
        "tags": ["Marvel Edition", "Special Edition", "Iron Man", "Arc Reactor", "LED Lamp", "Avengers"],
        "meta_title": "Iron Man Arc Reactor LED Desk Lamp - Marvel Special Edition",
        "meta_description": "Iron Man Arc Reactor replica LED desk lamp with 5 brightness modes and magnetic levitation base.",
        "slug": "iron-man-arc-reactor-desk-lamp",
    },
    {
        "name": "Avengers Assemble Extended Desk Mat",
        "description": "Epic extended desk mat featuring the original six Avengers in a dynamic action pose. Premium microfiber surface with precision tracking for mouse. Anti-slip natural rubber base. Stitched edges for durability. Water-resistant coating. 900mm x 400mm size covers your entire desk setup.",
        "price": 2799.00,
        "category": "Desk Mats",
        "brand": "Studioform x Marvel",
        "images": [
            "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 35,
        "is_featured": True,
        "tags": ["Marvel Edition", "Special Edition", "Avengers", "Desk Mat", "Extended"],
        "meta_title": "Avengers Assemble Extended Desk Mat - Marvel Special Edition",
        "meta_description": "Avengers-themed premium extended desk mat. 900x400mm, microfiber, anti-slip, stitched edges.",
        "slug": "avengers-assemble-desk-mat",
    },
    {
        "name": "Spider-Man Web-Shooter Cable Organizer",
        "description": "Organize your desk cables with style! This Spider-Man themed cable organizer features web-pattern channels that keep your charging cables, headphone wires, and USB cables neatly routed. Made from premium silicone with a weighted base. Holds up to 6 cables. Your friendly neighborhood desk accessory.",
        "price": 1299.00,
        "category": "Desk Accessories",
        "brand": "Studioform x Marvel",
        "images": [
            "https://images.unsplash.com/photo-1521714161819-15534968fc5f?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 50,
        "is_featured": False,
        "tags": ["Marvel Edition", "Special Edition", "Spider-Man", "Cable Organizer"],
        "meta_title": "Spider-Man Web-Shooter Cable Organizer - Marvel Special Edition",
        "meta_description": "Spider-Man themed cable organizer with web-pattern channels. Holds 6 cables, premium silicone.",
        "slug": "spider-man-cable-organizer",
    },
    {
        "name": "Captain America Shield Wireless Charger",
        "description": "Charge your devices on the iconic Vibranium shield! Premium wireless charger modeled after Captain America's shield. 15W fast Qi charging with LED ring effect that glows during charging. Aluminum alloy construction with rubberized base. Compatible with all Qi-enabled devices. Sentinel of your charging station.",
        "price": 2299.00,
        "category": "Tech Accessories",
        "brand": "Studioform x Marvel",
        "images": [
            "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 30,
        "is_featured": False,
        "tags": ["Marvel Edition", "Special Edition", "Captain America", "Wireless Charger", "Avengers"],
        "meta_title": "Captain America Shield Wireless Charger - Marvel Special Edition",
        "meta_description": "Captain America shield Qi wireless charger with 15W fast charging and LED ring effect.",
        "slug": "captain-america-shield-wireless-charger",
    },
    {
        "name": "Black Panther Vibranium Keyboard Wrist Rest",
        "description": "Rest your wrists on Wakandan technology. This premium memory foam wrist rest features Black Panther's iconic suit pattern with subtle purple kinetic energy accents. Cooling gel-infused memory foam with a non-slip velvet base. Ergonomic design for all-day comfort. Wakanda Forever.",
        "price": 1599.00,
        "category": "Desk Accessories",
        "brand": "Studioform x Marvel",
        "images": [
            "https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 40,
        "is_featured": False,
        "tags": ["Marvel Edition", "Special Edition", "Black Panther", "Wrist Rest", "Ergonomic"],
        "meta_title": "Black Panther Vibranium Wrist Rest - Marvel Special Edition",
        "meta_description": "Black Panther themed cooling memory foam keyboard wrist rest with Vibranium pattern design.",
        "slug": "black-panther-keyboard-wrist-rest",
    },

    # ==================== DC COMICS EDITION ====================
    {
        "name": "Batman Batcave Desk Organizer",
        "description": "The ultimate desk organizer inspired by the Batcave. Multi-tiered design with compartments for pens, phones, cards, and small gadgets. Features a bat-signal night light in the top section. Matte black premium ABS construction with brushed metal accents. Includes hidden drawer. Because your desk deserves a hero.",
        "price": 2999.00,
        "category": "Desk Accessories",
        "brand": "Studioform x DC",
        "images": [
            "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 25,
        "is_featured": True,
        "tags": ["DC Edition", "Special Edition", "Batman", "Desk Organizer", "Batcave"],
        "meta_title": "Batman Batcave Desk Organizer - DC Special Edition",
        "meta_description": "Batcave-inspired desk organizer with bat-signal night light, hidden drawer, and multiple compartments.",
        "slug": "batman-batcave-desk-organizer",
    },
    {
        "name": "Superman Fortress of Solitude LED Crystal Lamp",
        "description": "Bring the Fortress of Solitude to your desk with this stunning crystal LED lamp. Real crystal prism refracts light into mesmerizing patterns. Features Superman's iconic 'S' etched inside via laser engraving. RGB color modes with a wooden base. Touch-controlled with memory function. A beacon of hope for your workspace.",
        "price": 3299.00,
        "category": "Lighting",
        "brand": "Studioform x DC",
        "images": [
            "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 20,
        "is_featured": False,
        "tags": ["DC Edition", "Special Edition", "Superman", "Crystal Lamp", "LED", "Lighting"],
        "meta_title": "Superman Crystal LED Lamp - DC Special Edition",
        "meta_description": "Superman Fortress of Solitude crystal LED lamp with RGB colors and laser-etched 'S' symbol.",
        "slug": "superman-crystal-led-lamp",
    },
    {
        "name": "The Flash Speed Force Desk Mat",
        "description": "Feel the Speed Force under your fingertips! This premium desk mat features The Flash's lightning bolt motif with dynamic speed lines in scarlet and gold. Ultra-smooth surface optimized for fast mouse movements. Anti-slip base, stitched edges, and water-resistant coating. 800mm x 350mm. The fastest desk mat alive.",
        "price": 2499.00,
        "category": "Desk Mats",
        "brand": "Studioform x DC",
        "images": [
            "https://images.unsplash.com/photo-1534312527009-56c7016453e6?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 30,
        "is_featured": False,
        "tags": ["DC Edition", "Special Edition", "The Flash", "Desk Mat", "Speed Force"],
        "meta_title": "The Flash Speed Force Desk Mat - DC Special Edition",
        "meta_description": "The Flash themed premium desk mat with lightning bolt design. 800x350mm, anti-slip, water-resistant.",
        "slug": "flash-speed-force-desk-mat",
    },
    {
        "name": "Wonder Woman Lasso of Truth Headphone Stand",
        "description": "An elegant headphone stand inspired by Wonder Woman. The arm is designed to resemble the Lasso of Truth with gold-wrapped accents on a Themysciran marble-effect base. Holds all sizes of over-ear and on-ear headphones. Includes a cable management slot and anti-scratch silicone padding. Amazonian craftsmanship for your audio gear.",
        "price": 1999.00,
        "category": "Desk Accessories",
        "brand": "Studioform x DC",
        "images": [
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 30,
        "is_featured": False,
        "tags": ["DC Edition", "Special Edition", "Wonder Woman", "Headphone Stand"],
        "meta_title": "Wonder Woman Lasso Headphone Stand - DC Special Edition",
        "meta_description": "Wonder Woman themed headphone stand with Lasso of Truth design and marble-effect base.",
        "slug": "wonder-woman-headphone-stand",
    },

    # ==================== STAR WARS EDITION ====================
    {
        "name": "Darth Vader Helmet Pen & Stylus Holder",
        "description": "The Dark Lord of the Sith guards your stationery. This meticulously detailed Darth Vader helmet pen holder features breathing LED effects and holds up to 8 pens or styluses. Premium resin construction with matte black finish. The eyes glow red when you insert a pen. 'I find your lack of organization disturbing.'",
        "price": 2499.00,
        "category": "Desk Accessories",
        "brand": "Studioform x Star Wars",
        "images": [
            "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 25,
        "is_featured": True,
        "tags": ["Star Wars Edition", "Special Edition", "Darth Vader", "Pen Holder", "Sith"],
        "meta_title": "Darth Vader Helmet Pen Holder - Star Wars Special Edition",
        "meta_description": "Darth Vader helmet pen holder with LED breathing effects. Holds 8 pens, premium resin construction.",
        "slug": "darth-vader-helmet-pen-holder",
    },
    {
        "name": "Millennium Falcon Extended Desk Mat",
        "description": "Jump to hyperspace with this epic Millennium Falcon blueprint desk mat. Features detailed schematics of the fastest hunk of junk in the galaxy on a premium navy microfiber surface. Anti-slip rubber base, stitched edges. 900mm x 400mm full desk coverage. She may not look like much, but she's got it where it counts.",
        "price": 2799.00,
        "category": "Desk Mats",
        "brand": "Studioform x Star Wars",
        "images": [
            "https://images.unsplash.com/photo-1579566346927-c68383817a25?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 30,
        "is_featured": False,
        "tags": ["Star Wars Edition", "Special Edition", "Millennium Falcon", "Desk Mat", "Blueprint"],
        "meta_title": "Millennium Falcon Blueprint Desk Mat - Star Wars Special Edition",
        "meta_description": "Millennium Falcon blueprint desk mat. 900x400mm premium microfiber with stitched edges.",
        "slug": "millennium-falcon-desk-mat",
    },
    {
        "name": "Lightsaber RGB Desk Light Bar",
        "description": "Illuminate your workspace with the power of the Force. This screen-mounted light bar is designed to resemble a lightsaber hilt and projects RGB ambient lighting behind your monitor. Choose between Jedi blue, Sith red, Yoda green, Mace Windu purple, and more. Touch-activated with auto-dimming. USB-C powered. An elegant light bar for a more civilized workspace.",
        "price": 3799.00,
        "category": "Lighting",
        "brand": "Studioform x Star Wars",
        "images": [
            "https://images.unsplash.com/photo-1533613220915-609f661697d2?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 15,
        "is_featured": True,
        "tags": ["Star Wars Edition", "Special Edition", "Lightsaber", "RGB Light", "Monitor Light", "Lighting"],
        "meta_title": "Lightsaber RGB Desk Light Bar - Star Wars Special Edition",
        "meta_description": "Lightsaber-designed RGB monitor light bar with Force-inspired colors. USB-C, touch controls.",
        "slug": "lightsaber-rgb-desk-light-bar",
    },

    # ==================== ANIME EDITION ====================
    {
        "name": "Naruto Hidden Leaf Village Desk Mat",
        "description": "Represent the Hidden Leaf Village with this stunning desk mat featuring the iconic Konoha symbol and village skyline. Premium cloth surface with vibrant orange and black color scheme inspired by Naruto's outfit. Anti-slip rubber base, stitched edges, water-resistant. 800mm x 350mm. Believe it! Dattebayo!",
        "price": 2499.00,
        "category": "Desk Mats",
        "brand": "Studioform x Anime",
        "images": [
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 35,
        "is_featured": False,
        "tags": ["Anime Edition", "Special Edition", "Naruto", "Hidden Leaf", "Desk Mat"],
        "meta_title": "Naruto Hidden Leaf Village Desk Mat - Anime Special Edition",
        "meta_description": "Naruto-themed Konoha desk mat with Hidden Leaf Village design. 800x350mm, anti-slip, stitched edges.",
        "slug": "naruto-hidden-leaf-desk-mat",
    },
    {
        "name": "Dragon Ball Z Shenron LED Desk Lamp",
        "description": "Summon the Eternal Dragon to light up your desk! This spectacular Shenron-inspired LED lamp features a coiling dragon design that wraps around a glowing Dragon Ball. 7 color modes representing the 7 Dragon Balls. Touch-controlled brightness. USB-C powered with premium painted resin construction. Your wish... is granted.",
        "price": 3699.00,
        "category": "Lighting",
        "brand": "Studioform x Anime",
        "images": [
            "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 20,
        "is_featured": True,
        "tags": ["Anime Edition", "Special Edition", "Dragon Ball Z", "Shenron", "LED Lamp", "Lighting"],
        "meta_title": "Dragon Ball Z Shenron LED Lamp - Anime Special Edition",
        "meta_description": "Dragon Ball Z Shenron LED desk lamp with 7 Dragon Ball color modes. Premium resin, USB-C powered.",
        "slug": "dragon-ball-z-shenron-led-lamp",
    },
    {
        "name": "One Piece Straw Hat Crew Desk Organizer",
        "description": "Set sail on the Grand Line with this premium desk organizer inspired by the Thousand Sunny. Multi-compartment design with a ship-wheel pen holder, treasure chest drawer, and flag-pole memo clip. Finished in Straw Hat crew colors. Handcrafted wood and metal construction. The King of Desk Organizers!",
        "price": 2799.00,
        "category": "Desk Accessories",
        "brand": "Studioform x Anime",
        "images": [
            "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 25,
        "is_featured": False,
        "tags": ["Anime Edition", "Special Edition", "One Piece", "Desk Organizer", "Straw Hat"],
        "meta_title": "One Piece Straw Hat Crew Desk Organizer - Anime Special Edition",
        "meta_description": "One Piece Thousand Sunny inspired desk organizer with ship-wheel pen holder and treasure drawer.",
        "slug": "one-piece-desk-organizer",
    },
    {
        "name": "Attack on Titan Survey Corps Mouse Pad",
        "description": "Dedicate your heart! Premium mouse pad featuring the Survey Corps Wings of Freedom emblem on a dark, textured background. Optimized micro-woven surface for precise mouse control. Anti-slip rubber base. 300mm x 250mm standard size. Perfect for scouts who game or work at their desks. Shinzou wo Sasageyo!",
        "price": 999.00,
        "category": "Mouse Pads",
        "brand": "Studioform x Anime",
        "images": [
            "https://images.unsplash.com/photo-1563297007-0686b7003af7?auto=format&fit=crop&w=800&q=80"
        ],
        "stock": 50,
        "is_featured": False,
        "tags": ["Anime Edition", "Special Edition", "Attack on Titan", "Mouse Pad", "Survey Corps"],
        "meta_title": "Attack on Titan Survey Corps Mouse Pad - Anime Special Edition",
        "meta_description": "Attack on Titan Wings of Freedom mouse pad. Micro-woven surface, 300x250mm, anti-slip.",
        "slug": "attack-on-titan-mouse-pad",
    },
]

# Collection metadata for the frontend
COLLECTIONS = {
    "Harry Potter Edition": {
        "title": "Harry Potter Edition",
        "subtitle": "Wizarding World Desk Accessories",
        "description": "Transform your workspace into the Hogwarts common room with our enchanting Harry Potter collection. From Marauder's Map desk mats to Golden Snitch chargers — mischief managed.",
        "color": "#946B2D",  # Gryffindor gold
    },
    "Marvel Edition": {
        "title": "Marvel Edition",
        "subtitle": "Assemble Your Desk Setup",
        "description": "Channel the power of Earth's mightiest heroes with our Marvel desk accessories. Iron Man tech, Vibranium elegance, and web-slinging organization — your desk, assembled.",
        "color": "#ED1D24",  # Marvel red
    },
    "DC Edition": {
        "title": "DC Edition",
        "subtitle": "The Hero Your Desk Deserves",
        "description": "From the Batcave to the Fortress of Solitude — premium desk accessories inspired by DC's legendary heroes. Dark Knight organization meets Amazonian craftsmanship.",
        "color": "#0476F2",  # DC blue
    },
    "Star Wars Edition": {
        "title": "Star Wars Edition",
        "subtitle": "In a Galaxy Far, Far Away... On Your Desk",
        "description": "Lightsaber light bars, Millennium Falcon blueprints, and Sith Lord pen holders. The Force is strong with this collection of premium desk accessories.",
        "color": "#FFE81F",  # Star Wars yellow
    },
    "Anime Edition": {
        "title": "Anime Edition",
        "subtitle": "Power Up Your Workspace",
        "description": "From Hidden Leaf Village to the Grand Line — anime-inspired desk accessories featuring Naruto, Dragon Ball Z, One Piece and Attack on Titan. Plus Ultra!",
        "color": "#FF6B00",  # Anime orange
    },
}


async def add_special_edition_products():
    """Add special edition themed desk accessories to MongoDB"""
    client = motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
    database = client[settings.DATABASE_NAME]

    await init_beanie(database=database, document_models=[Product])

    print("🎬 Adding Special Edition desk accessories...")
    print("=" * 55)

    added = 0
    skipped = 0

    for product_data in SPECIAL_EDITION_PRODUCTS:
        # Check if product already exists (by slug)
        existing = await Product.find_one(Product.slug == product_data["slug"])
        if existing:
            print(f"  ⏭  Already exists: {product_data['name']}")
            skipped += 1
            continue

        product = Product(**product_data)
        await product.insert()
        added += 1
        collection_tag = next((t for t in product_data["tags"] if "Edition" in t), "Special")
        print(f"  ✅ [{collection_tag}] {product_data['name']} — ₹{product_data['price']:,.0f}")

    print("=" * 55)
    print(f"✅ Done! Added: {added} | Skipped (already exist): {skipped}")
    print(f"📦 Total special edition products in DB: {added + skipped}")
    print()
    print("Collections added:")
    for name in COLLECTIONS:
        count = len([p for p in SPECIAL_EDITION_PRODUCTS if name in p["tags"]])
        print(f"  🏷  {name}: {count} products")

    client.close()


if __name__ == "__main__":
    asyncio.run(add_special_edition_products())
