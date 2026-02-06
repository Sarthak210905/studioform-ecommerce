from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from beanie import PydanticObjectId
from datetime import datetime, timezone
import re

from app.models.collection import Collection
from app.models.product import Product
from app.models.user import User
from app.services.auth import get_current_active_user
from app.services.cache import cache_clear_pattern

router = APIRouter()


# ==================== Schemas ====================

class CollectionCreate(BaseModel):
    name: str
    title: str
    subtitle: Optional[str] = ""
    description: Optional[str] = ""
    banner_image: Optional[str] = None
    icon_name: Optional[str] = "Sparkles"
    gradient: Optional[str] = "from-purple-950 via-indigo-900 to-slate-900"
    accent_color: Optional[str] = "bg-purple-500"
    bg_pattern: Optional[str] = "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]"
    is_active: Optional[bool] = True
    position: Optional[int] = 0


class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    banner_image: Optional[str] = None
    icon_name: Optional[str] = None
    gradient: Optional[str] = None
    accent_color: Optional[str] = None
    bg_pattern: Optional[str] = None
    is_active: Optional[bool] = None
    position: Optional[int] = None


def slugify(text: str) -> str:
    """Generate slug from text"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text


def collection_to_dict(c: Collection) -> dict:
    return {
        "id": str(c.id),
        "name": c.name,
        "slug": c.slug,
        "title": c.title,
        "subtitle": c.subtitle,
        "description": c.description,
        "banner_image": c.banner_image,
        "icon_name": c.icon_name,
        "gradient": c.gradient,
        "accent_color": c.accent_color,
        "bg_pattern": c.bg_pattern,
        "is_active": c.is_active,
        "position": c.position,
        "product_count": c.product_count,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
    }


# ==================== PUBLIC ROUTES ====================

@router.get("/")
async def get_collections():
    """Get all active collections"""
    collections = await Collection.find(
        Collection.is_active == True
    ).sort([("position", 1)]).to_list()

    # Update product counts
    for col in collections:
        count = await Product.find(
            {"tags": col.name, "is_active": True}
        ).count()
        col.product_count = count

    return {"collections": [collection_to_dict(c) for c in collections]}


@router.get("/all")
async def get_all_collections(current_user: User = Depends(get_current_active_user)):
    """Get all collections including inactive (admin)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")

    collections = await Collection.find().sort([("position", 1)]).to_list()

    # Update product counts
    for col in collections:
        count = await Product.find(
            {"tags": col.name, "is_active": True}
        ).count()
        col.product_count = count

    return {"collections": [collection_to_dict(c) for c in collections]}


@router.get("/{collection_id}")
async def get_collection(collection_id: str):
    """Get a single collection by ID"""
    try:
        collection = await Collection.get(PydanticObjectId(collection_id))
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")

        count = await Product.find(
            {"tags": collection.name, "is_active": True}
        ).count()
        collection.product_count = count

        return collection_to_dict(collection)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid collection ID")


@router.get("/{collection_id}/products")
async def get_collection_products(
    collection_id: str,
    skip: int = 0,
    limit: int = 50,
    sort_by: str = "created_at",
    sort_order: str = "desc",
):
    """Get products in a collection"""
    try:
        collection = await Collection.get(PydanticObjectId(collection_id))
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid collection ID")

    query = Product.find({"tags": collection.name, "is_active": True})
    sort_field = getattr(Product, sort_by, Product.created_at)
    if sort_order == "asc":
        query = query.sort(+sort_field)
    else:
        query = query.sort(-sort_field)

    products = await query.skip(skip).limit(limit).to_list()
    total = await Product.find({"tags": collection.name, "is_active": True}).count()

    return {
        "collection": collection_to_dict(collection),
        "products": [
            {
                "id": str(p.id),
                "name": p.name,
                "description": p.description,
                "price": p.price,
                "final_price": p.final_price,
                "discount_active": p.discount_active,
                "discount_percentage": p.discount_percentage,
                "category": p.category,
                "brand": p.brand,
                "images": p.images,
                "main_image": p.main_image,
                "stock": p.stock,
                "total_stock": p.total_stock,
                "is_in_stock": p.is_in_stock,
                "has_variants": p.has_variants,
                "is_active": p.is_active,
                "is_featured": p.is_featured,
                "tags": p.tags,
                "sales_count": p.sales_count,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in products
        ],
        "total": total,
    }


# ==================== ADMIN ROUTES ====================

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_collection(
    data: CollectionCreate,
    current_user: User = Depends(get_current_active_user),
):
    """Create a new collection (admin only)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")

    # Check duplicate name
    existing = await Collection.find_one(Collection.name == data.name)
    if existing:
        raise HTTPException(status_code=400, detail="Collection with this name already exists")

    collection = Collection(
        name=data.name,
        slug=slugify(data.name),
        title=data.title,
        subtitle=data.subtitle or "",
        description=data.description or "",
        banner_image=data.banner_image,
        icon_name=data.icon_name or "Sparkles",
        gradient=data.gradient or "from-purple-950 via-indigo-900 to-slate-900",
        accent_color=data.accent_color or "bg-purple-500",
        bg_pattern=data.bg_pattern or "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]",
        is_active=data.is_active if data.is_active is not None else True,
        position=data.position or 0,
    )
    await collection.insert()
    cache_clear_pattern("products:*")
    return collection_to_dict(collection)


@router.put("/{collection_id}")
async def update_collection(
    collection_id: str,
    data: CollectionUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """Update a collection (admin only)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        collection = await Collection.get(PydanticObjectId(collection_id))
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid collection ID")

    old_name = collection.name
    update_data = data.dict(exclude_unset=True)

    if "name" in update_data and update_data["name"] != old_name:
        # Rename the tag on all products
        update_data["slug"] = slugify(update_data["name"])
        product_collection = Product.get_motor_collection()
        await product_collection.update_many(
            {"tags": old_name},
            {"$set": {"tags.$[elem]": update_data["name"]}},
            array_filters=[{"elem": old_name}],
        )

    for key, value in update_data.items():
        setattr(collection, key, value)
    collection.updated_at = datetime.now(timezone.utc)
    await collection.save()

    cache_clear_pattern("products:*")
    return collection_to_dict(collection)


@router.delete("/{collection_id}")
async def delete_collection(
    collection_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """Delete a collection (admin only)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        collection = await Collection.get(PydanticObjectId(collection_id))
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid collection ID")

    await collection.delete()
    cache_clear_pattern("products:*")
    return {"message": f"Collection '{collection.name}' deleted successfully"}


# ==================== PRODUCT <-> COLLECTION MANAGEMENT ====================

@router.post("/{collection_id}/products/{product_id}")
async def add_product_to_collection(
    collection_id: str,
    product_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """Add a product to a collection by adding the collection tag"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        collection = await Collection.get(PydanticObjectId(collection_id))
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid collection ID")

    try:
        product = await Product.get(PydanticObjectId(product_id))
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    tags_to_add = []
    if collection.name not in product.tags:
        tags_to_add.append(collection.name)
    if "Special Edition" not in product.tags:
        tags_to_add.append("Special Edition")

    if tags_to_add:
        product.tags.extend(tags_to_add)
        product.updated_at = datetime.now(timezone.utc)
        await product.save()

    cache_clear_pattern("products:*")
    return {"success": True, "message": f"Product added to {collection.name}"}


@router.delete("/{collection_id}/products/{product_id}")
async def remove_product_from_collection(
    collection_id: str,
    product_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """Remove a product from a collection by removing the collection tag"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        collection = await Collection.get(PydanticObjectId(collection_id))
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid collection ID")

    try:
        product = await Product.get(PydanticObjectId(product_id))
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    if collection.name in product.tags:
        product.tags.remove(collection.name)

    # If no other edition tags remain, remove "Special Edition" too
    has_other_edition = any(
        t for t in product.tags
        if t.endswith("Edition") and t != "Special Edition" and t != "Limited Edition"
    )
    if not has_other_edition and "Special Edition" in product.tags:
        product.tags.remove("Special Edition")

    product.updated_at = datetime.now(timezone.utc)
    await product.save()

    cache_clear_pattern("products:*")
    return {"success": True, "message": f"Product removed from {collection.name}"}


@router.post("/seed-defaults")
async def seed_default_collections(
    current_user: User = Depends(get_current_active_user),
):
    """Seed default collections if none exist (admin only)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")

    existing = await Collection.find().count()
    if existing > 0:
        return {"message": f"{existing} collections already exist. Skipping seed."}

    defaults = [
        {
            "name": "Harry Potter Edition",
            "title": "Harry Potter",
            "subtitle": "Wizarding World Desk Accessories",
            "description": "Transform your workspace into the Hogwarts common room. From Marauder's Map desk mats to Golden Snitch chargers — mischief managed.",
            "icon_name": "Wand2",
            "gradient": "from-amber-900 via-amber-800 to-yellow-900",
            "accent_color": "bg-amber-500",
            "bg_pattern": "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]",
            "position": 1,
        },
        {
            "name": "Marvel Edition",
            "title": "Marvel",
            "subtitle": "Assemble Your Desk Setup",
            "description": "Channel the power of Earth's mightiest heroes. Iron Man tech, Vibranium elegance, and web-slinging organization — your desk, assembled.",
            "icon_name": "Shield",
            "gradient": "from-red-900 via-red-800 to-red-950",
            "accent_color": "bg-red-500",
            "bg_pattern": "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
            "position": 2,
        },
        {
            "name": "DC Edition",
            "title": "DC Comics",
            "subtitle": "The Hero Your Desk Deserves",
            "description": "From the Batcave to the Fortress of Solitude — premium desk accessories inspired by DC's legendary heroes.",
            "icon_name": "Zap",
            "gradient": "from-blue-900 via-blue-800 to-indigo-950",
            "accent_color": "bg-blue-500",
            "bg_pattern": "bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))]",
            "position": 3,
        },
        {
            "name": "Star Wars Edition",
            "title": "Star Wars",
            "subtitle": "In a Galaxy Far, Far Away... On Your Desk",
            "description": "Lightsaber light bars, Millennium Falcon blueprints, and Sith Lord pen holders. The Force is strong with this collection.",
            "icon_name": "Star",
            "gradient": "from-gray-900 via-gray-800 to-yellow-950",
            "accent_color": "bg-yellow-500",
            "bg_pattern": "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]",
            "position": 4,
        },
        {
            "name": "Anime Edition",
            "title": "Anime",
            "subtitle": "Power Up Your Workspace",
            "description": "From Hidden Leaf Village to the Grand Line — Naruto, Dragon Ball Z, One Piece & Attack on Titan inspired accessories. Plus Ultra!",
            "icon_name": "Swords",
            "gradient": "from-orange-900 via-orange-800 to-red-950",
            "accent_color": "bg-orange-500",
            "bg_pattern": "bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))]",
            "position": 5,
        },
    ]

    created = 0
    for d in defaults:
        col = Collection(
            name=d["name"],
            slug=slugify(d["name"]),
            title=d["title"],
            subtitle=d["subtitle"],
            description=d["description"],
            icon_name=d["icon_name"],
            gradient=d["gradient"],
            accent_color=d["accent_color"],
            bg_pattern=d["bg_pattern"],
            position=d["position"],
            is_active=True,
        )
        await col.insert()
        created += 1

    return {"message": f"Seeded {created} default collections"}
