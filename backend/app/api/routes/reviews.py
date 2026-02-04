from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId

from app.models.review import Review
from app.models.product import Product
from app.models.order import Order
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse, ProductRatingStats
from app.services.auth import get_current_active_user

router = APIRouter()

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Create product review"""
    
    # Check if product exists
    try:
        product = await Product.get(PydanticObjectId(review_data.product_id))
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    # Check if user already reviewed this product
    existing_review = await Review.find_one(
        Review.product_id == review_data.product_id,
        Review.user_id == str(current_user.id)
    )
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this product"
        )
    
    # Check if user has purchased and received this product
    user_orders = await Order.find(
        Order.user_id == str(current_user.id),
        Order.status == "delivered"
    ).to_list()
    
    has_purchased = False
    for order in user_orders:
        for item in order.items:
            if item.product_id == review_data.product_id:
                has_purchased = True
                break
        if has_purchased:
            break
    
    # Only allow reviews from verified purchases
    if not has_purchased:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review products you have purchased and received"
        )
    
    # Create review
    review = Review(
        product_id=review_data.product_id,
        user_id=str(current_user.id),
        user_name=current_user.full_name or current_user.username,
        rating=review_data.rating,
        title=review_data.title,
        comment=review_data.comment,
        is_verified_purchase=True  # Always true now since we enforce purchase
    )
    await review.insert()
    
    # Update product rating and reviews count
    all_reviews = await Review.find(Review.product_id == review_data.product_id).to_list()
    total_rating = sum(r.rating for r in all_reviews)
    avg_rating = total_rating / len(all_reviews) if all_reviews else 0
    
    product.rating = round(avg_rating, 1)
    product.reviews_count = len(all_reviews)
    await product.save()
    
    return ReviewResponse(
        id=str(review.id),
        product_id=review.product_id,
        user_id=review.user_id,
        user_name=review.user_name,
        rating=review.rating,
        title=review.title,
        comment=review.comment,
        is_verified_purchase=review.is_verified_purchase,
        helpful_count=review.helpful_count,
        created_at=review.created_at
    )

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
async def get_product_reviews(product_id: str):
    """Get all reviews for a product"""
    
    reviews = await Review.find(
        Review.product_id == product_id
    ).sort(-Review.created_at).to_list()
    
    return [
        ReviewResponse(
            id=str(review.id),
            product_id=review.product_id,
            user_id=review.user_id,
            user_name=review.user_name,
            rating=review.rating,
            title=review.title,
            comment=review.comment,
            is_verified_purchase=review.is_verified_purchase,
            helpful_count=review.helpful_count,
            created_at=review.created_at
        )
        for review in reviews
    ]

@router.get("/product/{product_id}/stats", response_model=ProductRatingStats)
async def get_product_rating_stats(product_id: str):
    """Get rating statistics for a product"""
    
    reviews = await Review.find(Review.product_id == product_id).to_list()
    
    if not reviews:
        return ProductRatingStats(
            average_rating=0.0,
            total_reviews=0,
            rating_distribution={5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
        )
    
    total_reviews = len(reviews)
    total_rating = sum(r.rating for r in reviews)
    average_rating = round(total_rating / total_reviews, 1)
    
    # Calculate distribution
    distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
    for review in reviews:
        distribution[review.rating] += 1
    
    return ProductRatingStats(
        average_rating=average_rating,
        total_reviews=total_reviews,
        rating_distribution=distribution
    )

@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Update your own review"""
    
    try:
        review = await Review.get(PydanticObjectId(review_id))
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid review ID"
        )
    
    # Verify ownership
    if review.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this review"
        )
    
    review.rating = review_data.rating
    review.title = review_data.title
    review.comment = review_data.comment
    review.updated_at = datetime.utcnow()
    await review.save()
    
    return ReviewResponse(
        id=str(review.id),
        product_id=review.product_id,
        user_id=review.user_id,
        user_name=review.user_name,
        rating=review.rating,
        title=review.title,
        comment=review.comment,
        is_verified_purchase=review.is_verified_purchase,
        helpful_count=review.helpful_count,
        created_at=review.created_at
    )

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete your own review"""
    
    try:
        review = await Review.get(PydanticObjectId(review_id))
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid review ID"
        )
    
    # Verify ownership or admin
    if review.user_id != str(current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this review"
        )
    
    product_id = review.product_id
    await review.delete()
    
    # Update product rating and reviews count after deletion
    try:
        product = await Product.get(PydanticObjectId(product_id))
        if product:
            all_reviews = await Review.find(Review.product_id == product_id).to_list()
            if all_reviews:
                total_rating = sum(r.rating for r in all_reviews)
                avg_rating = total_rating / len(all_reviews)
                product.rating = round(avg_rating, 1)
                product.reviews_count = len(all_reviews)
            else:
                product.rating = 0.0
                product.reviews_count = 0
            await product.save()
    except Exception:
        pass  # If product update fails, at least review is deleted

@router.post("/{review_id}/helpful", response_model=ReviewResponse)
async def mark_review_helpful(
    review_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Mark review as helpful"""
    
    try:
        review = await Review.get(PydanticObjectId(review_id))
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        review.helpful_count += 1
        await review.save()
        
        return ReviewResponse(
            id=str(review.id),
            product_id=review.product_id,
            user_id=review.user_id,
            user_name=review.user_name,
            rating=review.rating,
            title=review.title,
            comment=review.comment,
            is_verified_purchase=review.is_verified_purchase,
            helpful_count=review.helpful_count,
            created_at=review.created_at
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid review ID"
        )
