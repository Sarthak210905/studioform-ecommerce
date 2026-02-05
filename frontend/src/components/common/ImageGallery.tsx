import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  discount?: number;
  isOutOfStock?: boolean;
}

// Optimize image URL for Cloudinary
const optimizeImageUrl = (url: string, width?: number, height?: number): string => {
  if (!url) return url;
  
  // If it's a Cloudinary URL, add optimization parameters
  if (url.includes('cloudinary.com')) {
    const params = [
      'q_auto', // Auto quality based on format
      'f_auto', // Auto format (WebP for modern browsers)
      'dpr_auto', // Device pixel ratio
      width ? `w_${width}` : 'w_1200', // Width
      height ? `h_${height}` : '', // Height
      'c_fill', // Fill mode
    ].filter(Boolean).join(',');
    
    // Insert transformation params into Cloudinary URL
    return url.replace('/image/upload/', `/image/upload/${params}/`);
  }
  
  return url;
};

export default function ImageGallery({ images, productName, discount, isOutOfStock }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setImageLoading(true);
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setImageLoading(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Safety check to prevent NaN
    if (!rect.width || !rect.height || rect.width === 0 || rect.height === 0) {
      return;
    }

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setZoomPosition({ x: xPercent, y: yPercent });
  };

  const currentImage = images[selectedImage];
  const optimizedMainImage = optimizeImageUrl(currentImage, 800, 800);

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div
        className="relative bg-muted rounded-lg overflow-hidden aspect-square group cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        {/* Loading Skeleton */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted animate-pulse" />
        )}

        <img
          src={optimizedMainImage}
          alt={productName}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isZoomed ? 'scale-150' : 'scale-100'
          } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setImageLoading(false)}
          style={
            isZoomed
              ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }
              : undefined
          }
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Zoom Button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2 right-2 bg-white/90 hover:bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
          aria-label="Zoom"
        >
          <ZoomIn className="h-5 w-5" />
        </button>

        {/* Badge Overlays */}
        {discount && discount > 0 && (
          <Badge className="absolute top-3 left-3 text-lg">{discount}% OFF</Badge>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg">
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
            {selectedImage + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-auto pb-2">
          {images.map((image, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedImage(idx);
                setImageLoading(true);
              }}
              className={`flex-shrink-0 w-16 h-16 rounded-md border-2 overflow-hidden transition ${
                selectedImage === idx ? 'border-primary ring-2 ring-primary' : 'border-muted hover:border-muted-foreground'
              }`}
              aria-label={`Select image ${idx + 1}`}
            >
              <img 
                src={optimizeImageUrl(image, 64, 64)} 
                alt={`${productName} ${idx + 1}`} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:bg-white/10 p-2 rounded-full transition"
            aria-label="Close fullscreen"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={images[selectedImage]}
              alt={productName}
              className="max-w-full max-h-full object-contain"
            />

            {/* Fullscreen Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 text-white hover:bg-white/10 p-3 rounded-full transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 text-white hover:bg-white/10 p-3 rounded-full transition"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>

                {/* Fullscreen Thumbnails */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-12 h-12 rounded border-2 overflow-hidden transition ${
                        selectedImage === idx ? 'border-white' : 'border-white/30 hover:border-white/60'
                      }`}
                      aria-label={`Select image ${idx + 1}`}
                    >
                      <img src={image} alt={`${productName} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 right-4 text-white text-sm">
              {selectedImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
