import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { api } from '@/lib/axios';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  final_price: number;
  discount_percentage: number;
  discount_active: boolean;
  category: string;
  brand?: string;
  images: string[];
  stock: number;
  rating?: number;
  reviews_count?: number;
}

interface ProductQuickViewProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Optimize image URL for Cloudinary
const optimizeImageUrl = (url: string, width?: number, height?: number): string => {
  if (!url) return url;
  
  if (url.includes('cloudinary.com')) {
    const params = [
      'q_auto',
      'f_auto',
      'dpr_auto',
      width ? `w_${width}` : 'w_600',
      height ? `h_${height}` : '',
      'c_fill',
    ].filter(Boolean).join(',');
    
    return url.replace('/image/upload/', `/image/upload/${params}/`);
  }
  
  return url;
};

export default function ProductQuickView({ productId, isOpen, onClose }: ProductQuickViewProps) {
  const { toast } = useToast();
  const { addItem } = useCartStore();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const isInWishlist = wishlistItems.some((item) => item.product_id === productId);

  useEffect(() => {
    if (isOpen && productId) {
      loadProduct();
    }
  }, [isOpen, productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data);
      setSelectedImage(0);
      setQuantity(1);
      setImageLoading(true);
    } catch (error) {
      console.error('Failed to load product:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      const cartItem = {
        id: product.id,
        product_id: product.id,
        product_name: product.name,
        product_price: product.final_price,
        quantity,
        image_url: product.images[0],
        stock_quantity: product.stock,
        subtotal: product.final_price * quantity,
      };

      addItem(cartItem);
      toast({
        title: 'Added to Cart',
        description: `${quantity} × ${product.name}`,
      });
      onClose();
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast({ title: 'Removed from Wishlist' });
    } else {
      addToWishlist({
        id: product.id,
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.images[0],
        category: product.category,
        is_active: true,
      });
      toast({ title: 'Added to Wishlist' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quick View</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Section */}
            <div className="space-y-3">
              <div className="bg-muted rounded-lg aspect-square overflow-hidden relative">
                {imageLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted animate-pulse z-10" />
                )}
                <img
                  src={optimizeImageUrl(product.images[selectedImage], 600, 600)}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-opacity ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                  loading="lazy"
                  onLoad={() => setImageLoading(false)}
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-auto">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedImage(idx);
                        setImageLoading(true);
                      }}
                      className={`w-16 h-16 rounded-md border-2 overflow-hidden flex-shrink-0 transition ${
                        selectedImage === idx ? 'border-primary' : 'border-muted'
                      }`}
                    >
                      <img 
                        src={optimizeImageUrl(img, 64, 64)} 
                        alt={`${product.name} ${idx + 1}`} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-2xl font-bold">{product.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
                  </div>
                  {product.discount_active && (
                    <Badge className="ml-2">{product.discount_percentage}% OFF</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">₹{product.final_price.toLocaleString()}</span>
                {product.discount_active && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              {product.rating !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating?.toFixed(1)} ({product.reviews_count || 0} reviews)
                  </span>
                </div>
              )}

              <p className="text-sm text-muted-foreground">{product.description}</p>

              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-1 hover:bg-muted disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="px-4 py-1 border-l border-r">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="px-3 py-1 hover:bg-muted disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {product.stock === 0 && <div className="text-sm font-medium text-red-600">Out of Stock</div>}
                {product.stock > 0 && product.stock <= 5 && (
                  <div className="text-sm font-medium text-orange-600">Only {product.stock} left!</div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addingToCart}
                  >
                    {addingToCart ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleWishlistToggle}>
                    <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current text-red-600' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
