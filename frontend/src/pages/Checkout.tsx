import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/axios';
import { wakeUpBackend, startCriticalKeepAlive } from '@/utils/keepAlive';
import { Loader2, CreditCard, Truck, MapPin, Package, ShieldCheck } from 'lucide-react';
import RazorpayPayment from '@/components/common/RazorpayPayment';
import shippingService from '@/services/shipping.service';
import TrustBadges from '@/components/common/TrustBadges';

interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
}

interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, total, clearCart, syncCartToBackend } = useCartStore();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [useNewAddress, setUseNewAddress] = useState(false);
  const paymentMethod = 'razorpay';
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string>('');
  const [userPhone, setUserPhone] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const [newAddress, setNewAddress] = useState<ShippingAddress>({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    
    // Start aggressive keep-alive during checkout
    const stopCriticalPing = startCriticalKeepAlive();
    
    loadAddresses();
    
    return () => {
      stopCriticalPing();
    };
  }, []);
  
  // Recalculate shipping when address or payment method changes (debounced for pincode typing)
  useEffect(() => {
    // Only calculate if pincode is valid (6 digits) or using saved address
    const shouldCalculate = !useNewAddress
      ? savedAddresses.length > 0 && selectedAddressId
      : newAddress.pincode.length === 6 && newAddress.state;
    
    if (!shouldCalculate) return;
    
    const timer = setTimeout(() => {
      calculateShipping();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [selectedAddressId, useNewAddress, newAddress.pincode, newAddress.state, total, paymentMethod]);

  const loadAddresses = async () => {
    try {
      const response = await api.get('/addresses/');
      setSavedAddresses(response.data);
      
      if (response.data.length === 0) {
        // No saved addresses, use new address form
        setUseNewAddress(true);
        // Set default shipping immediately
        setShippingCost(150);
      } else {
        // Find default address or use first address
        const defaultAddress = response.data.find((addr: Address) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          // Shipping will be calculated by the useEffect when selectedAddressId changes
        } else {
          // No default address, select the first one
          setSelectedAddressId(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      // If failed to load, assume new address and set default shipping
      setUseNewAddress(true);
      setShippingCost(150);
    }
  };

  const calculateShipping = async (pincode?: string, state?: string) => {
    try {
      // Get pincode and state from address
      let targetPincode = pincode;
      let targetState = state;
      
      if (!targetPincode || !targetState) {
        if (!useNewAddress && selectedAddressId) {
          const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
          if (selectedAddress) {
            targetPincode = selectedAddress.pincode;
            targetState = selectedAddress.state;
          }
        } else if (useNewAddress && newAddress.pincode && newAddress.state) {
          targetPincode = newAddress.pincode;
          targetState = newAddress.state;
        }
      }
      
      // Only calculate if we have both pincode and state
      if (targetPincode && targetState) {
        // Calculate potential COD amount for accurate shipping
        // const estimatedPlatformFee = total * 0.02;
        // const potentialTotal = total + estimatedPlatformFee;
        
        console.log('Calculating shipping for:', { targetPincode, targetState, paymentMethod });
        
        const result = await shippingService.calculateShipping({
          pincode: targetPincode,
          state: targetState,
          subtotal: total,
          weight_kg: 1.0,
          payment_mode: 'Prepaid',
          cod_amount: 0
        });
        
        console.log('Shipping result:', result);
        setShippingCost(result.shipping_cost);
      } else {
        // Default fallback - set immediately (check subtotal for free shipping)
        console.log('Using fallback shipping calculation');
        setShippingCost(total >= 1499 ? 0 : 150);
      }
    } catch (error) {
      console.error('Failed to calculate shipping:', error);
      // Fallback to simple calculation (check subtotal for free shipping)
      setShippingCost(total >= 1499 ? 0 : 150);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddress({ ...newAddress, [e.target.id]: e.target.value });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const response = await api.post(`/coupons/validate?subtotal=${total}`, {
        coupon_code: couponCode,
      });

      if (response.data.valid) {
        setDiscount(response.data.discount_amount);
        toast({
          title: 'Coupon Applied!',
          description: response.data.message,
        });
      } else {
        toast({
          title: 'Invalid Coupon',
          description: response.data.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Invalid coupon code',
        variant: 'destructive',
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    // Validate shipping cost is calculated
    if (shippingCost === null) {
      toast({
        title: 'Please Wait',
        description: 'Calculating shipping costs...',
        variant: 'destructive',
      });
      return;
    }

    // Validate address
    let shippingAddress: any;
    let phone = '';

    if (useNewAddress) {
      if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || 
          !newAddress.city || !newAddress.state || !newAddress.pincode) {
        toast({
          title: 'Incomplete Address',
          description: 'Please fill in all required address fields',
          variant: 'destructive',
        });
        return;
      }
      // Validate phone number (Indian 10-digit)
      if (!/^[6-9]\d{9}$/.test(newAddress.phone)) {
        toast({
          title: 'Invalid Phone Number',
          description: 'Please enter a valid 10-digit Indian phone number',
          variant: 'destructive',
        });
        return;
      }
      // Validate pincode (6 digits)
      if (!/^\d{6}$/.test(newAddress.pincode)) {
        toast({
          title: 'Invalid Pincode',
          description: 'Please enter a valid 6-digit pincode',
          variant: 'destructive',
        });
        return;
      }
      shippingAddress = newAddress;
      phone = newAddress.phone;
    } else {
      if (!selectedAddressId) {
        toast({
          title: 'No Address Selected',
          description: 'Please select a delivery address',
          variant: 'destructive',
        });
        return;
      }
      const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
      if (!selectedAddress) {
        toast({
          title: 'Address Not Found',
          description: 'Selected address could not be found',
          variant: 'destructive',
        });
        return;
      }
      shippingAddress = {
        full_name: selectedAddress.full_name,
        phone: selectedAddress.phone,
        address_line1: selectedAddress.address_line1,
        address_line2: selectedAddress.address_line2 || undefined,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        country: selectedAddress.country || 'India',
      };
      phone = selectedAddress.phone;
    }

    setLoading(true);
    try {
      // Pre-warm the backend to prevent timeout on Render free tier
      await wakeUpBackend(3);
      
      // Sync cart to backend before placing order
      await syncCartToBackend();

      const orderData = {
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        coupon_code: couponCode || undefined,
      };

      console.log('Creating order with data:', orderData);
      const response = await api.post('/orders/', orderData);

      // Store user details for Razorpay
      setUserPhone(phone);
      setOrderNumber(response.data.order_number);
      setPendingOrderId(response.data.id);

      // Show Razorpay payment gateway
      setShowRazorpay(true);
    } catch (error: any) {
      console.error('Order creation failed:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: 'Order Failed',
        description: error.response?.data?.detail || 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpaySuccess = async (paymentId: string) => {
    console.log('Payment successful:', paymentId);
    
    // Clear frontend cart immediately (backend cart already cleared after payment verification)
    clearCart();
    
    // Show success message
    toast({
      title: 'Order Placed Successfully!',
      description: `Order #${orderNumber}`,
    });
    
    // Navigate to success page
    navigate(`/order-success/${pendingOrderId}`, { replace: true });
  };

  const handleRazorpayFailure = (reason: string) => {
    setShowRazorpay(false);
    toast({
      title: 'Payment Failed',
      description: reason,
      variant: 'destructive',
    });
  };

  const subtotal = total;
  const platformFee = subtotal * 0.02; // 2% platform fee
  const finalTotal = Math.max(0, subtotal + (shippingCost || 0) + platformFee - discount);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
      {showRazorpay && (
        <RazorpayPayment
          orderId={pendingOrderId}
          amount={subtotal + (shippingCost || 0) + platformFee - discount}
          orderNumber={orderNumber}
          userEmail={user?.email || ''}
          userPhone={userPhone}
          onSuccess={handleRazorpaySuccess}
          onFailure={handleRazorpayFailure}
        />
      )}
      
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Checkout</h1>
      
      {/* Trust Badges */}
      <TrustBadges />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Delivery Address */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base">Select Saved Address</Label>
                  <RadioGroup value={useNewAddress ? 'new' : selectedAddressId} onValueChange={(value) => {
                    if (value === 'new') {
                      setUseNewAddress(true);
                      setSelectedAddressId('');
                    } else {
                      setUseNewAddress(false);
                      setSelectedAddressId(value);
                    }
                  }}>
                    {savedAddresses.map((address) => (
                      <div key={address.id} className="flex items-start space-x-2 sm:space-x-3 border rounded-lg p-3 sm:p-4 touch-manipulation">
                        <RadioGroupItem value={address.id} id={address.id} className="mt-0.5" />
                        <label htmlFor={address.id} className="flex-1 cursor-pointer min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                            <span className="font-semibold text-sm sm:text-base">{address.label}</span>
                            {address.is_default && (
                              <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm">{address.full_name} - {address.phone}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {address.address_line1}, {address.address_line2 && `${address.address_line2}, `}
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2 sm:space-x-3 border rounded-lg p-3 sm:p-4 touch-manipulation">
                      <RadioGroupItem value="new" id="new" />
                      <label htmlFor="new" className="cursor-pointer font-medium text-sm sm:text-base">
                        Use a new address
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* New Address Form */}
              {(useNewAddress || savedAddresses.length === 0) && (
                <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="full_name" className="text-sm">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={newAddress.full_name}
                        onChange={handleAddressChange}
                        className="h-10 sm:h-11 text-base"
                        required
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={newAddress.phone}
                        onChange={handleAddressChange}
                        className="h-10 sm:h-11 text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="address_line1" className="text-sm">Address Line 1 *</Label>
                    <Input
                      id="address_line1"
                      value={newAddress.address_line1}
                      onChange={handleAddressChange}
                      className="h-10 sm:h-11 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="address_line2" className="text-sm">Address Line 2</Label>
                    <Input
                      id="address_line2"
                      value={newAddress.address_line2}
                      onChange={handleAddressChange}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="city" className="text-sm">City *</Label>
                      <Input
                        id="city"
                        value={newAddress.city}
                        onChange={handleAddressChange}
                        className="h-10 sm:h-11 text-base"
                        required
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="state" className="text-sm">State *</Label>
                      <Input
                        id="state"
                        value={newAddress.state}
                        onChange={handleAddressChange}
                        className="h-10 sm:h-11 text-base"
                        required
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="pincode" className="text-sm">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={newAddress.pincode}
                        onChange={handleAddressChange}
                        className="h-10 sm:h-11 text-base"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-2 sm:space-x-3 border rounded-lg p-3 sm:p-4 bg-primary/5">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">Online Payment (Razorpay)</div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Secure payment using UPI, Cards, Net Banking, Wallets</p>
                    <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">100% Secure</Badge>
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">SSL Encrypted</Badge>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 flex-shrink-0" />
                  We do not offer Cash on Delivery (COD) for online orders
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Order Summary */}
          <Card className="lg:sticky lg:top-24">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Items */}
              <div className="space-y-2 sm:space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-2 sm:gap-3">
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium line-clamp-2">{item.product_name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-xs sm:text-sm font-semibold">₹{item.subtotal.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Coupon Code */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm">Coupon Code</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="h-9 sm:h-10 text-sm"
                  />
                  <Button
                    variant="outline"
                    className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm touch-manipulation"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                  >
                    {validatingCoupon ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === null ? 'Calculating...' : shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (2%)</span>
                  <span>₹{platformFee.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between text-base sm:text-lg font-bold">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>

              {/* Place Order Button */}
              <Button
                size="lg"
                className="w-full h-11 sm:h-12 text-base touch-manipulation"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>

              {/* Delivery Info */}
              <div className="text-[10px] sm:text-xs text-muted-foreground text-center">
                <Truck className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                Expected delivery in 5-7 business days
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
