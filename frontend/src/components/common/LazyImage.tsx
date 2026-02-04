import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  blurDataURL?: string;
  sizes?: string;
}

export default function LazyImage({
  src,
  alt,
  className,
  containerClassName,
  blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg==',
  sizes,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Load images slightly before they come into view
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  // Generate WebP and fallback URLs if Cloudinary
  const getOptimizedSrc = () => {
    if (!src) return src;
    
    // Check if it's a Cloudinary URL
    if (src.includes('cloudinary.com')) {
      // Add quality and format optimizations
      const parts = src.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/f_auto,q_auto:good/${parts[1]}`;
      }
    }
    return src;
  };

  const getWebPSrc = () => {
    if (!src) return null;
    
    // Check if it's a Cloudinary URL
    if (src.includes('cloudinary.com')) {
      const parts = src.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/f_webp,q_auto:good/${parts[1]}`;
      }
    }
    return null;
  };

  const optimizedSrc = getOptimizedSrc();
  const webpSrc = getWebPSrc();

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden bg-muted', containerClassName)}>
      {/* Blur placeholder */}
      {!isLoaded && !imageError && (
        <img
          src={blurDataURL}
          alt=""
          className={cn('absolute inset-0 w-full h-full object-cover blur-sm', className)}
          aria-hidden="true"
        />
      )}

      {/* Actual image with WebP support */}
      {isInView && (
        <>
          {webpSrc ? (
            <picture>
              <source srcSet={webpSrc} type="image/webp" sizes={sizes} />
              <img
                src={optimizedSrc}
                alt={alt}
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-300',
                  isLoaded ? 'opacity-100' : 'opacity-0',
                  className
                )}
                onLoad={() => setIsLoaded(true)}
                onError={() => setImageError(true)}
                loading="lazy"
                sizes={sizes}
              />
            </picture>
          ) : (
            <img
              src={optimizedSrc}
              alt={alt}
              className={cn(
                'w-full h-full object-cover transition-opacity duration-300',
                isLoaded ? 'opacity-100' : 'opacity-0',
                className
              )}
              onLoad={() => setIsLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
              sizes={sizes}
            />
          )}
        </>
      )}

      {/* Error state */}
      {imageError && (
        <div className={cn('flex items-center justify-center bg-muted', className)}>
          <span className="text-muted-foreground text-sm">Image not available</span>
        </div>
      )}
    </div>
  );
}
