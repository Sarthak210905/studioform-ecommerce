import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { wishlistService } from '@/services/wishlist.service';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';
import type { WishlistItem } from '@/types';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist(wishlist.filter(item => item.product_id !== productId));
      toast({
        title: 'Removed',
        description: 'Item removed from wishlist',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      });
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      addItem({
        id: item.product_id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_price: item.product_price,
        quantity: 1,
        image_url: item.image_url || '',
        stock_quantity: 0, // Will be updated from product details
        subtotal: item.product_price,
      });
      toast({
        title: 'Added to Cart',
        description: `${item.product_name} added to cart`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add to cart',
        variant: 'destructive',
      });
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear your wishlist?')) return;
    
    try {
      await wishlistService.clearWishlist();
      setWishlist([]);
      toast({
        title: 'Wishlist Cleared',
        description: 'All items removed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear wishlist',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardContent className="p-16 text-center space-y-6">
            <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
              <p className="text-muted-foreground">
                Save your favorite items for later
              </p>
            </div>
            <Button size="lg" asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">{wishlist.length} items saved</p>
        </div>
        <Button variant="outline" onClick={handleClearAll}>
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => (
          <Card key={item.id} className="group">
            <div className="aspect-square bg-muted relative overflow-hidden">
              {item.image_url && (
                <img 
                  src={item.image_url} 
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                />
              )}
              <Badge 
                className="absolute top-2 right-2"
                variant={item.in_stock ? "secondary" : "destructive"}
              >
                {item.in_stock ? 'In Stock' : 'Out of Stock'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 left-2 bg-white/80 hover:bg-white"
                onClick={() => handleRemove(item.product_id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <CardContent className="p-4 space-y-3">
              <Link to={`/products/${item.product_id}`}>
                <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                  {item.product_name}
                </h3>
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">₹{item.final_price.toLocaleString()}</span>
                {item.discount_percentage > 0 && (
                  <>
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{item.product_price.toLocaleString()}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {item.discount_percentage}% OFF
                    </Badge>
                  </>
                )}
              </div>
              <Button 
                className="w-full" 
                size="sm"
                onClick={() => handleAddToCart(item)}
                disabled={!item.in_stock}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {item.in_stock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
