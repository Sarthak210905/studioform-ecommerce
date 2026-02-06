from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from app.services.auth import get_current_user
from app.services.cloudinary import upload_image

router = APIRouter()


@router.post("/image")
async def upload_image_endpoint(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    """Upload an image to Cloudinary (authenticated users only)"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can upload images",
        )

    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are allowed",
        )

    # Validate file size (5 MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be less than 5MB",
        )

    # Strip extension from filename for the public_id
    filename = file.filename.rsplit(".", 1)[0] if file.filename else "upload"

    image_url = await upload_image(contents, filename, folder="banners")
    if not image_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image to Cloudinary",
        )

    return {"url": image_url}
