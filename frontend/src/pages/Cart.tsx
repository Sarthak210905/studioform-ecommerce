import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cartStore';
import ExitIntentPopup from '@/components/common/ExitIntentPopup';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { items, cart, updateQuantity, removeItem, clearCart } = useCartStore();
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    // Recalculate totals when component mounts
    useCartStore.getState().calculateTotal();
    // Load cross-sell suggestions
    productService.getFeaturedProducts(4).then((products) => {
      // Filter out products already in cart
      const cartProductIds = new Set(useCartStore.getState().items.map(i => i.product_id));
      setSuggestions((products || []).filter((p: Product) => !cartProductIds.has(p.id)).slice(0, 4));
    }).catch(() => {});
  }, []);

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  // Safe access to cart values with defaults
  const totalPrice = cart?.total_price || 0;
  const totalItems = cart?.total_items || 0;
  const estimatedShipping = totalPrice >= 1499 ? 0 : 150;
  const estimatedTotal = totalPrice + estimatedShipping;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some products to get started
            </p>
            <Button asChild>
              <Link to="/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Shopping Cart</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {items.map((item) => {
            const price = item.product_price || 0;
            const subtotal = item.subtotal || (price * item.quantity);

            return (
              <Card key={item.product_id}>
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {/* Product Image */}
                    <Link 
                      to={`/products/${item.product_id}`}
                      className="flex-shrink-0 mx-auto sm:mx-0"
                    >
                      <img
                        src={item.image_url || '/placeholder.png'}
                        alt={item.product_name || 'Product'}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/products/${item.product_id}`}
                        className="hover:text-primary"
                      >
                        <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 line-clamp-2">
                          {item.product_name || 'Unknown Product'}
                        </h3>
                      </Link>
                      
                      <p className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
                        ₹{price.toLocaleString()}
                      </p>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 touch-manipulation"
                            onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <span className="w-10 sm:w-12 text-center font-medium text-sm sm:text-base">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 touch-manipulation"
                            onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                            disabled={item.quantity >= (item.stock_quantity || 0)}
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>

                        {/* Subtotal - Mobile */}
                        <div className="sm:hidden text-right w-full">
                          <p className="text-sm text-muted-foreground">Subtotal</p>
                          <p className="font-bold text-lg">
                            ₹{subtotal.toLocaleString()}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.product_id)}
                          className="text-destructive hover:text-destructive w-full sm:w-auto touch-manipulation"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Subtotal - Desktop */}
                    <div className="hidden sm:block text-right">
                      <p className="font-bold text-lg">
                        ₹{subtotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Clear Cart Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              asChild
              className="flex-1"
            >
              <Link to="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={clearCart}
              className="flex-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-24">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Order Summary</h2>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Est. Shipping</span>
                  <span className={`font-medium ${estimatedShipping === 0 ? 'text-green-600' : ''}`}>
                    {estimatedShipping === 0 ? 'FREE' : `₹${estimatedShipping}`}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between text-base sm:text-lg font-bold pt-1">
                  <span>Est. Total</span>
                  <span>₹{estimatedTotal.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Final total calculated at checkout (includes platform fee &amp; exact shipping).
                </p>
              </div>

              <Button 
                className="w-full h-11 sm:h-12 text-base touch-manipulation" 
                size="lg"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-3 sm:mt-4">
                Platform fee and shipping calculated at checkout
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cross-sell Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-8 sm:mt-12">
          <h2 className="text-lg sm:text-xl font-bold mb-4">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {suggestions.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`} className="group">
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-muted overflow-hidden">
                    {product.main_image && (
                      <img
                        src={product.main_image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <CardContent className="p-2.5 sm:p-3">
                    <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{product.name}</p>
                    <p className="text-sm font-bold mt-1">₹{product.final_price.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Exit Intent Popup */}
      <ExitIntentPopup cartItemCount={items.length} />
    </div>
  );
}
