import cloudinary
import cloudinary.uploader
from app.core.config import settings

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

async def upload_image(file_content: bytes, filename: str, folder: str = "products") -> str:
    """
    Upload image to Cloudinary
    Returns the secure URL of uploaded image
    """
    try:
        result = cloudinary.uploader.upload(
            file_content,
            folder=folder,
            public_id=filename,
            overwrite=True,
            resource_type="image"
        )
        return result['secure_url']
    except Exception as e:
        print(f"Error uploading image: {e}")
        return None

async def delete_image(public_id: str) -> bool:
    """Delete image from Cloudinary"""
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get('result') == 'ok'
    except Exception as e:
        print(f"Error deleting image: {e}")
        return False
