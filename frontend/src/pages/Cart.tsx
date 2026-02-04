import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cartStore';
import ExitIntentPopup from '@/components/common/ExitIntentPopup';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { items, cart, updateQuantity, removeItem, clearCart } = useCartStore();

  useEffect(() => {
    // Recalculate totals when component mounts
    useCartStore.getState().calculateTotal();
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
  const shippingCost = totalPrice >= 1499 ? 0 : 150;
  const finalTotal = totalPrice + shippingCost;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
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
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
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
                            <Plus className="h-3 w:h-3 sm:h-4 sm:w-4" />
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
          <Button
            variant="outline"
            onClick={clearCart}
            className="w-full"
          >
            Clear Cart
          </Button>
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
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between text-base sm:text-lg font-bold pt-1">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>
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

      {/* Exit Intent Popup */}
      <ExitIntentPopup cartItemCount={items.length} />
    </div>
  );
}
