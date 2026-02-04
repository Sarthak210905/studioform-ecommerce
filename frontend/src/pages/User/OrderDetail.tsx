import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import ReviewForm from '@/components/common/ReviewForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import reviewService from '@/services/review.service';
import {
  Package,
  MapPin,
  CreditCard,
  Download,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Star,
  RotateCcw,
} from 'lucide-react';

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

interface OrderDetailType {
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
  updated_at: string;
}

const orderStatuses = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null); // product_id
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const returnType = 'exchange'; // Fixed to exchange only
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    loadOrderDetail();
  }, [id]);

  const loadOrderDetail = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to load order:', error);
      toast({
        title: 'Error',
        description: 'Failed to load order details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`);
      toast({
        title: 'Order Cancelled',
        description: 'Your order has been cancelled successfully',
      });
      loadOrderDetail();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel order',
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
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
      toast({
        title: 'Error',
        description: 'Failed to download invoice',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitReview = async (productId: string, data: { rating: number; title?: string; comment?: string }) => {
    try {
      await reviewService.createReview({
        product_id: productId,
        ...data,
      });
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your review!',
      });
      setShowReviewForm(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to submit review',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCurrentStatusIndex = (status: string) => {
    const index = orderStatuses.findIndex((s) => s.key === status.toLowerCase());
    return index === -1 ? 0 : index;
  };

  const handleCreateReturn = async () => {
    if (!order) return;
    if (!returnReason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a brief reason for your request.',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingReturn(true);
    try {
      await api.post('/returns/', {
        order_id: order.id,
        request_type: returnType,
        reason: returnReason.trim(),
        items: order.items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          reason: returnReason.trim(),
        })),
      });

      toast({
        title: 'Request submitted',
        description: 'We have received your request. We will update you soon.',
      });
      setReturnDialogOpen(false);
      setReturnReason('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to submit request',
        variant: 'destructive',
      });
    } finally {
      setSubmittingReturn(false);
    }
  };

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
        <Button onClick={() => navigate('/profile/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex(order.status);
  const isCancelled = order.status.toLowerCase() === 'cancelled';

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/profile/orders')}
        className="mb-4 sm:mb-6 -ml-2"
        size="sm"
      >
        <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Back to Orders</span>
        <span className="sm:hidden">Back</span>
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
            Order #{order.order_number}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusColor(order.status)}>
            {order.status.toUpperCase()}
          </Badge>
          {order.payment_status === 'paid' ? (
            <Badge className="bg-green-100 text-green-700">PAID</Badge>
          ) : (
            <Badge className="bg-orange-100 text-orange-700">PAYMENT PENDING</Badge>
          )}
          {order.status === 'delivered' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setReturnDialogOpen(true)}
              className="flex items-center gap-2 hidden sm:flex"
            >
              <RotateCcw className="h-4 w-4" />
              Request Exchange
            </Button>
          )}
        </div>
        {/* Mobile Action Buttons */}
        <div className="flex flex-col sm:hidden gap-2">
          {(order.status === 'pending' || order.status === 'processing') && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="w-full"
            >
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Order'
              )}
            </Button>
          )}
          {order.status === 'delivered' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setReturnDialogOpen(true)}
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Request Exchange
            </Button>
          )}
        </div>
      </div>

      {/* Order Status Timeline */}
      {!isCancelled && (
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4 sm:mb-6 text-sm sm:text-base">Order Status</h3>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 sm:top-6 left-0 w-full h-0.5 bg-gray-200">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${(currentStatusIndex / (orderStatuses.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Status Steps */}
              <div className="relative flex justify-between">
                {orderStatuses.map((statusItem, index) => {
                  const Icon = statusItem.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div key={statusItem.key} className="flex flex-col items-center max-w-[70px] sm:max-w-none">
                      <div
                        className={`relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                          isCompleted
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <p
                        className={`text-xs sm:text-sm text-center leading-tight ${
                          isCompleted ? 'font-semibold' : 'text-muted-foreground'
                        }`}
                      >
                        {statusItem.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {order.status === 'shipped' && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-700 font-medium">
                  📦 Your order is on the way! Estimated delivery: {order.estimated_delivery}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cancelled Status */}
      {isCancelled && (
        <Card className="mb-4 sm:mb-6 border-red-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start sm:items-center gap-3 text-red-600">
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-base sm:text-lg">Order Cancelled</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  This order was cancelled on{' '}
                  {new Date(order.updated_at).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Order Items */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                Order Items ({order.items.length})
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {order.items.map((item, index) => {
                  const pricePerItem = item.subtotal / item.quantity;
                  const hasProductDiscount = item.original_price && item.discount_percentage && item.discount_percentage > 0;
                  
                  return (
                    <div key={index}>
                      <div className="flex gap-3 sm:gap-4">
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium mb-1 text-sm sm:text-base line-clamp-2">{item.product_name}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                            Quantity: <span className="font-semibold text-foreground">{item.quantity}</span>
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                              {hasProductDiscount ? (
                                <>
                                  <span className="text-xs sm:text-sm text-muted-foreground line-through">₹{item.original_price!.toLocaleString()}</span>
                                  <span className="text-xs sm:text-sm font-medium">₹{pricePerItem.toLocaleString()}</span>
                                  <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 rounded">
                                    {item.discount_percentage}% OFF
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs sm:text-sm font-medium">₹{pricePerItem.toLocaleString()}</span>
                              )}
                              <span className="text-[10px] sm:text-xs text-muted-foreground">per item</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 pt-1">
                              <span className="text-base sm:text-lg font-bold text-primary">₹{item.subtotal.toLocaleString()}</span>
                              <span className="text-[10px] sm:text-xs text-muted-foreground">subtotal</span>
                            </div>
                          </div>
                          {order.status === 'delivered' && (
                            <div className="mt-2 sm:mt-3">
                              {showReviewForm === item.product_id ? (
                                <div className="border rounded-lg p-3 sm:p-4 bg-muted/50">
                                  <ReviewForm
                                    productId={item.product_id}
                                    onSubmit={(data) => handleSubmitReview(item.product_id, data)}
                                    onCancel={() => setShowReviewForm(null)}
                                  />
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowReviewForm(item.product_id)}
                                >
                                  <Star className="mr-2 h-4 w-4" />
                                  Write Review
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {index < order.items.length - 1 && <Separator className="mt-4" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                Delivery Address
              </h3>
              <div className="text-xs sm:text-sm space-y-1">
                <p className="font-medium text-sm sm:text-base">{order.shipping_address.full_name}</p>
                <p className="text-muted-foreground">{order.shipping_address.phone}</p>
                <p className="text-muted-foreground mt-2">
                  {order.shipping_address.address_line1}
                  {order.shipping_address.address_line2 &&
                    `, ${order.shipping_address.address_line2}`}
                </p>
                <p className="text-muted-foreground">
                  {order.shipping_address.city}, {order.shipping_address.state} -{' '}
                  {order.shipping_address.pincode}
                </p>
                <p className="text-muted-foreground">{order.shipping_address.country}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-4 sm:space-y-6">
          {/* Payment Info */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                Payment Details
              </h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium uppercase">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{order.payment_status}</span>
                </div>
                {order.coupon_code && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coupon</span>
                    <span className="font-medium">{order.coupon_code}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Order Summary</h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {order.shipping_cost === 0 ? 'FREE' : `₹${order.shipping_cost}`}
                  </span>
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
                <div className="flex justify-between text-sm sm:text-base font-bold pt-1">
                  <span>Total Paid</span>
                  <span>₹{order.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions - Hidden on mobile, shown on desktop */}
          <div className="space-y-3 hidden sm:block">
            {order.status === 'delivered' ? (
              <Button className="w-full" onClick={handleDownloadInvoice}>
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
            ) : (
              <Button className="w-full" variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" />
                Invoice available after delivery
              </Button>
            )}

            {(order.status === 'pending' || order.status === 'processing') && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Order'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Request Product Exchange</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              We offer exchanges within 7 days of delivery for defective products only. No returns or refunds available. Please describe the defect or issue with your product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Request Type</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled
                >
                  Exchange Only
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ⚠️ We only accept exchanges for defective products. Returns and refunds are not available.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Defect/Issue Description *</label>
              <Textarea
                placeholder="Please describe the defect or issue with the product in detail"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Items included:</p>
              <ul className="list-disc list-inside space-y-1">
                {order.items.map((item) => (
                  <li key={item.product_id}>
                    {item.product_name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setReturnDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateReturn} 
              disabled={submittingReturn}
              className="w-full sm:w-auto"
            >
              {submittingReturn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
