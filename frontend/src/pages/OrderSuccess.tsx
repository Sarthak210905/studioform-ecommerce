import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/axios';
import { CheckCircle, Package, Home, Loader2 } from 'lucide-react';

interface OrderItem {
  product_id: string;
  product_name: string;
  product_price: number;
  original_price?: number;
  discount_percentage?: number;
  quantity: number;
  image_url: string;
  subtotal: number;
}

interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface Order {
  id: string;
  order_number: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount_amount: number;
  coupon_code?: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_address: ShippingAddress;
  shipping_zone: string;
  estimated_delivery: string;
  created_at: string;
}

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  /* const handleDownloadInvoice = async () => {
    try {
      const response = await api.get(`/orders/${id}/invoice`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order?.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
    } catch (error) {
      console.error('Failed to download invoice:', error);
    }
  }; */

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-muted-foreground">
          Thank you for your order. We'll send you a confirmation email shortly.
        </p>
      </div>

      {/* Order Details Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <p className="text-2xl font-bold">{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Order Date</p>
              <p className="font-semibold">
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Delivery Timeline */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Estimated Delivery</p>
                <p className="text-sm text-muted-foreground">{order.estimated_delivery}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold">Order Items</h3>
            {order.items.map((item, index) => {
              const pricePerItem = item.subtotal / item.quantity;
              const hasProductDiscount = item.original_price && item.discount_percentage && item.discount_percentage > 0;
              
              return (
                <div key={index} className="flex gap-4 p-4 border rounded-lg">
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{item.product_name}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      {hasProductDiscount ? (
                        <>
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{item.original_price!.toLocaleString()}
                          </span>
                          <span className="text-sm font-medium">₹{pricePerItem.toLocaleString()}</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            {item.discount_percentage}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-medium">₹{pricePerItem.toLocaleString()}</span>
                      )}
                      <span className="text-xs text-muted-foreground">× {item.quantity}</span>
                    </div>
                    <p className="font-semibold text-primary">₹{item.subtotal.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="mb-6" />

          {/* Payment & Delivery Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Payment Details */}
            <div>
              <h3 className="font-semibold mb-3">Payment Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium uppercase">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className="font-medium capitalize">{order.payment_status}</span>
                </div>
                {order.coupon_code && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coupon Applied</span>
                    <span className="font-medium">{order.coupon_code}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <h3 className="font-semibold mb-3">Delivery Address</h3>
              <div className="text-sm">
                <p className="font-medium">{order.shipping_address.full_name}</p>
                <p className="text-muted-foreground">{order.shipping_address.phone}</p>
                <p className="text-muted-foreground mt-2">
                  {order.shipping_address.address_line1}
                  {order.shipping_address.address_line2 && `, ${order.shipping_address.address_line2}`}
                </p>
                <p className="text-muted-foreground">
                  {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                </p>
                <p className="text-muted-foreground">{order.shipping_address.country}</p>
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Price Summary */}
          <div className="space-y-2 text-sm max-w-sm ml-auto">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shipping_cost === 0 ? 'FREE' : `₹${order.shipping_cost}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee (2%)</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                <span>-₹{order.discount_amount.toLocaleString()}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Paid</span>
              <span>₹{order.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
      
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={() => navigate('/orders')}
        >
          <Package className="mr-2 h-4 w-4" />
          View All Orders
        </Button>
        <Button
          size="lg"
          className="flex-1"
          onClick={() => navigate('/')}
        >
          <Home className="mr-2 h-4 w-4" />
          Continue Shopping
        </Button>
      </div>

      {/* Additional Info */}
      <Card className="mt-6 bg-muted/30">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">What's Next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• You will receive an order confirmation email with tracking details</li>
            <li>• Track your order status in the Orders section</li>
            <li>• You can cancel your order before it's shipped</li>
            <li>• Contact support if you have any questions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
