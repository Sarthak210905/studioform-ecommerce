// src/pages/ProductDetail.tsx - Updated version

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { api } from '@/lib/axios';
import ReviewSection from '@/components/common/ReviewSection';
import ImageGallery from '@/components/common/ImageGallery';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProductRecommendations from '@/components/common/ProductRecommendations';
import RecentlyViewed from '@/components/common/RecentlyViewed';
import SocialShare from '@/components/common/SocialShare';
import SEOHead from '@/components/common/SEOHead';
import { getProductSchema, getBreadcrumbSchema } from '@/utils/seoSchemas';
import { trackProductView, trackAddToCart } from '@/utils/analytics';
import type { Product } from '@/types';
import {
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RefreshCw,
  Minus,
  Plus,
  Loader2,
  MessageCircle,
} from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCartStore();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  // Check if product is in wishlist
  const isInWishlist = wishlistItems.some((item) => item.product_id === id);

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar when scrolled past action buttons on mobile
      if (window.innerWidth < 768) {
        setShowStickyBar(window.scrollY > 600);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (product) {
      // Track product view
      trackProductView({
        id: product.id,
        name: product.name,
        price: product.final_price,
        category: product.category
      });
    }
  }, [product]);

  const loadProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to load product:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product details',
        variant: 'destructive',
      });
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Require variant selection if product has variants
    if (product.has_variants && product.variants && product.variants.length > 0 && !selectedVariant) {
      toast({ title: 'Please select a variant', description: 'Choose a size/color before adding to cart', variant: 'destructive' });
      return;
    }

    const cartItem = {
      id: product.id + (selectedVariant ? `-${selectedVariant}` : ''),
      product_id: product.id,
      product_name: product.name + (selectedVariant ? ` (${product.variants?.find(v => v.sku === selectedVariant)?.name || ''})` : ''),
      product_price: effectivePrice,
      quantity,
      image_url: (selectedVariant && product.variants?.find(v => v.sku === selectedVariant)?.image_url) || (product.images?.[0] ?? ''),
      stock_quantity: effectiveStock,
      subtotal: effectivePrice * quantity,
    };

    addItem(cartItem);

    // Track add to cart event
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.final_price,
      quantity
    });

    toast({
      title: 'Added to Cart',
      description: `${quantity} × ${product.name} added to your cart`,
    });
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast({
        title: 'Removed from Wishlist',
        description: `${product.name} removed from your wishlist`,
      });
    } else {
      addToWishlist({
        id: product.id,
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.images[0],
        category: product.category || 'Uncategorized',
        is_active: product.is_active,
      });
      toast({
        title: 'Added to Wishlist',
        description: `${product.name} added to your wishlist`,
      });
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (effectiveStock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Require variant selection if product has variants
    if (product.has_variants && product.variants && product.variants.length > 0 && !selectedVariant) {
      toast({ title: 'Please select a variant', description: 'Choose a size/color before purchasing', variant: 'destructive' });
      return;
    }

    const cartItem = {
      id: product.id + (selectedVariant ? `-${selectedVariant}` : ''),
      product_id: product.id,
      product_name: product.name + (selectedVariant ? ` (${product.variants?.find(v => v.sku === selectedVariant)?.name || ''})` : ''),
      product_price: effectivePrice,
      quantity,
      image_url: (selectedVariant && product.variants?.find(v => v.sku === selectedVariant)?.image_url) || (product.images?.[0] ?? ''),
      stock_quantity: effectiveStock,
      subtotal: effectivePrice * quantity,
    };

    addItem(cartItem);

    // Track add to cart event
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.final_price,
      quantity
    });

    // Navigate directly to checkout
    navigate('/checkout');
  };

  const handleWhatsAppSupport = () => {
    const phoneNumber = '918349007721'; // StudioForm WhatsApp Business
    const message = product 
      ? encodeURIComponent(`Hi, I need help with ${product.name} (₹${product.final_price})`)
      : encodeURIComponent('Hi, I need help with a product');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const calculateDiscount = () => {
    if (!product) return 0;
    
    // If discount_active and discount_percentage is set, use it
    if (product.discount_active && product.discount_percentage > 0) {
      return Math.round(product.discount_percentage);
    }
    
    // Otherwise calculate from price difference
    if (product.price > product.final_price) {
      const discountPercent = ((product.price - product.final_price) / product.price) * 100;
      return Math.round(discountPercent);
    }
    
    return 0;
  };

  // Get effective price/stock based on selected variant
  const getVariantInfo = () => {
    if (!product) return { effectivePrice: 0, effectiveStock: 0 };
    if (!product.has_variants || !selectedVariant) {
      return { effectivePrice: product.final_price, effectiveStock: product.stock };
    }
    const variant = product.variants?.find(v => v.sku === selectedVariant);
    if (!variant) return { effectivePrice: product.final_price, effectiveStock: product.stock };
    return {
      effectivePrice: Math.round((product.final_price + variant.price_adjustment) * 100) / 100,
      effectiveStock: variant.stock,
    };
  };

  const { effectivePrice, effectiveStock } = getVariantInfo();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  const discount = calculateDiscount();

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
      {product && (
        <SEOHead
          title={product.name}
          description={product.description || `Premium ${product.name} - High quality desk accessories for your workspace`}
          keywords={`${product.name}, ${product.category}, premium desk accessories, workspace`}
          ogImage={product.images?.[0] ?? undefined}
          ogType="product"
          canonical={`${window.location.origin}/products/${product.id}`}
          schema={[
            getProductSchema(product),
            getBreadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: 'Products', url: '/products' },
              { name: product.category || 'Products', url: `/products?category=${product.category}` },
              { name: product.name, url: `/products/${product.id}` }
            ])
          ]}
        />
      )}
      
      {/* Breadcrumb */}
      <Breadcrumb />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">
        {/* Product Images - Using Image Gallery */}
        <ImageGallery 
          images={product.images} 
          productName={product.name}
          discount={discount}
          isOutOfStock={product.stock === 0}
        />

        {/* Product Info */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Category & Brand */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">{product.category}</Badge>
              {product.brand && <Badge variant="secondary" className="text-xs">{product.brand}</Badge>}
            </div>
            <SocialShare
              url={window.location.href}
              title={product.name}
              description={product.description}
              image={product.images?.[0]}
            />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">{product.name}</h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold">₹{product.final_price.toLocaleString()}</span>
            {product.price > product.final_price && discount > 0 && (
              <>
                <span className="text-lg sm:text-xl text-muted-foreground line-through">
                  ₹{product.price.toLocaleString()}
                </span>
                <Badge variant="destructive" className="text-xs">{discount}% OFF</Badge>
              </>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">Description</h3>
            <p className="text-sm sm:text-base text-muted-foreground">{product.description}</p>
          </div>

          <Separator />

          {/* Stock Status */}
          <div>
            {effectiveStock > 0 ? (
              <>
                <p className="text-green-600 font-medium">In Stock</p>
                {effectiveStock <= 10 && (
                  <p className="text-orange-600 text-sm font-semibold mt-1">
                    🔥 Only {effectiveStock} left in stock - Order soon!
                  </p>
                )}
              </>
            ) : (
              <p className="text-red-600 font-medium">Out of Stock</p>
            )}
          </div>

          {/* Variant Selector */}
          {product.has_variants && product.variants && product.variants.length > 0 && (
            <div>
              <Label className="mb-2 block text-sm sm:text-base">
                Select Variant
              </Label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.sku}
                    onClick={() => {
                      setSelectedVariant(variant.sku === selectedVariant ? null : variant.sku);
                      setQuantity(1);
                    }}
                    disabled={variant.stock === 0}
                    className={`
                      px-3 py-2 rounded-lg border text-sm font-medium transition-all touch-manipulation
                      ${variant.sku === selectedVariant
                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                        : variant.stock === 0
                          ? 'border-muted bg-muted/30 text-muted-foreground line-through cursor-not-allowed opacity-50'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }
                    `}
                  >
                    {variant.name}
                    {variant.price_adjustment !== 0 && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({variant.price_adjustment > 0 ? '+' : ''}₹{variant.price_adjustment})
                      </span>
                    )}
                    {variant.stock === 0 && <span className="ml-1 text-xs">(Sold out)</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          {effectiveStock > 0 && (
            <div role="group" aria-label="Product quantity selector">
              <Label className="mb-2 block text-sm sm:text-base" htmlFor="quantity-display">Quantity</Label>
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                </Button>
                <span 
                  id="quantity-display"
                  className="text-lg sm:text-xl font-semibold w-10 sm:w-12 text-center"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= effectiveStock}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:gap-3" role="group" aria-label="Product actions">
            {/* Buy Now & Add to Cart Row */}
            <div className="flex gap-2 sm:gap-3">
              <Button
                className="flex-1 h-11 sm:h-12 text-sm sm:text-base touch-manipulation bg-orange-600 hover:bg-orange-700"
                size="lg"
                onClick={handleBuyNow}
                disabled={effectiveStock === 0}
                aria-label={`Buy ${product.name} now for ${effectivePrice} rupees`}
              >
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                Buy Now
              </Button>
              <Button
                className="flex-1 h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
                size="lg"
                variant="outline"
                onClick={handleAddToCart}
                disabled={effectiveStock === 0}
                aria-label={`Add ${quantity} ${product.name} to cart`}
              >
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                Add to Cart
              </Button>
              <Button
                variant={isInWishlist ? 'default' : 'outline'}
                size="lg"
                className="h-11 w-11 sm:h-12 sm:w-12 p-0 touch-manipulation"
                onClick={handleWishlistToggle}
                aria-label={isInWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                aria-pressed={isInWishlist}
              >
                <Heart
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${isInWishlist ? 'fill-current' : ''}`}
                  aria-hidden="true"
                />
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2 sm:py-3 bg-muted/50 rounded-lg px-2">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                <span className="font-medium">100% Secure</span>
              </div>
              <div className="h-4 w-px bg-border hidden sm:block"></div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
                <span className="font-medium">SSL Protected</span>
              </div>
              <div className="h-4 w-px bg-border hidden sm:block"></div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                </svg>
                <span className="font-medium">Safe Payment</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <Card>
            <CardContent className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-xs sm:text-sm">Free Delivery</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    On orders above ₹1499
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 sm:gap-3">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-xs sm:text-sm">Secure Payment</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    100% secure transactions
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 sm:gap-3">
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-xs sm:text-sm">Exchange Only</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    7 days for defective products
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Reviews Section */}
      <div className="mt-8 sm:mt-12">
        <ReviewSection productId={product.id} />
      </div>

      {/* Recently Viewed */}
      <div className="mt-8 sm:mt-12">
        <RecentlyViewed />
      </div>

      {/* Product Recommendations */}
      {product.category && (
        <div className="mt-8 sm:mt-12">
          <ProductRecommendations 
            currentProductId={product.id} 
            category={product.category} 
          />
        </div>
      )}
      </div>

      {/* Sticky Action Bar - Mobile Only */}
      {showStickyBar && effectiveStock > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg md:hidden">
          <div className="container px-3 py-2.5 flex items-center gap-2">
            <div className="flex-1 flex gap-2">
              <Button
                className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 touch-manipulation"
                onClick={handleBuyNow}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buy Now
              </Button>
              <Button
                className="flex-1 h-12 touch-manipulation"
                variant="outline"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
            <Button
              variant={isInWishlist ? 'default' : 'outline'}
              size="icon"
              className="h-12 w-12 touch-manipulation"
              onClick={handleWishlistToggle}
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      )}

      {/* WhatsApp Support Button - Floating */}
      <button
        onClick={handleWhatsAppSupport}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 bg-green-500 hover:bg-green-600 text-white rounded-full p-3 sm:p-4 shadow-lg transition-all hover:scale-110 active:scale-95 touch-manipulation"
        aria-label="WhatsApp Support"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </div>
  );
}
