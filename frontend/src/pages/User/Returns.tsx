import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { api } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Search, Loader2, X, PackageX, Eye } from 'lucide-react';

interface ReturnItem {
  id: string;
  order_id: string;
  order_number: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  reason: string;
  description: string;
  status: string;
  refund_amount: number;
  created_at: string;
  updated_at: string;
}

interface EligibleOrder {
  id: string;
  order_number: string;
  items: Array<{
    product_id: string;
    product_name: string;
    image_url: string;
    quantity: number;
    price: number;
  }>;
  order_date: string;
}

const returnReasons = [
  'Defective or damaged product',
  'Wrong item received',
  'Product not as described',
  'Changed mind',
  'Size/fit issues',
  'Quality not satisfactory',
  'Other',
];

export default function Returns() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState<EligibleOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<EligibleOrder | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      const response = await api.get('/returns/');
      setReturns(response.data);
    } catch (error) {
      console.error('Failed to load returns:', error);
      toast({
        title: 'Error',
        description: 'Failed to load returns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEligibleOrders = async () => {
    try {
      const response = await api.get('/returns/eligible-orders');
      setEligibleOrders(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load eligible orders',
        variant: 'destructive',
      });
    }
  };

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
    loadEligibleOrders();
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setSelectedOrder(null);
    setSelectedProduct('');
    setReturnReason('');
    setReturnDescription('');
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrder || !selectedProduct || !returnReason) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/returns/', {
        order_id: selectedOrder.id,
        product_id: selectedProduct,
        reason: returnReason,
        description: returnDescription,
      });

      toast({
        title: 'Success',
        description: 'Return request submitted successfully',
      });

      loadReturns();
      handleCloseCreateDialog();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to submit return request',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredReturns = returns.filter(
    (item) =>
      item.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Returns & Refunds</h1>
          <p className="text-muted-foreground">
            Manage your return requests and track refunds
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Request Return
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number or product..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Returns List */}
      {filteredReturns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <PackageX className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No returns found' : 'No return requests yet'}
            </h3>
            <p className="text-muted-foreground mb-6 text-center">
              {searchQuery
                ? 'Try searching with different keywords'
                : 'You haven\'t requested any returns yet'}
            </p>
            {!searchQuery && (
              <Button onClick={handleOpenCreateDialog}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Request Your First Return
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReturns.map((returnItem) => (
            <Card key={returnItem.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Image */}
                  <img
                    src={returnItem.product_image}
                    alt={returnItem.product_name}
                    className="w-full md:w-32 h-32 object-cover rounded-lg"
                  />

                  {/* Return Details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {returnItem.product_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Order #{returnItem.order_number}
                        </p>
                      </div>
                      <Badge className={getStatusColor(returnItem.status)}>
                        {returnItem.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Reason</p>
                        <p className="text-sm font-medium">{returnItem.reason}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Refund Amount
                        </p>
                        <p className="text-sm font-medium">
                          ₹{returnItem.refund_amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Quantity</p>
                        <p className="text-sm font-medium">{returnItem.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Requested On
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(returnItem.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {returnItem.description && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-1">Description</p>
                        <p className="text-sm">{returnItem.description}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/profile/orders/${returnItem.order_id}`)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View Order
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Return Stats */}
      {returns.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-primary">{returns.length}</p>
              <p className="text-sm text-muted-foreground">Total Returns</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {returns.filter((r) => r.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-green-600">
                {returns.filter((r) => r.status === 'approved' || r.status === 'completed').length}
              </p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-red-600">
                {returns.filter((r) => r.status === 'rejected').length}
              </p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Return Request Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Return</DialogTitle>
            <DialogDescription>
              Select an order and product to initiate a return request
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitReturn} className="space-y-4">
            {/* Select Order */}
            <div>
              <Label htmlFor="order">Select Order *</Label>
              <select
                id="order"
                value={selectedOrder?.id || ''}
                onChange={(e) => {
                  const order = eligibleOrders.find((o) => o.id === e.target.value);
                  setSelectedOrder(order || null);
                  setSelectedProduct('');
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Choose an order</option>
                {eligibleOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    Order #{order.order_number} - {new Date(order.order_date).toLocaleDateString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Product */}
            {selectedOrder && (
              <div>
                <Label htmlFor="product">Select Product *</Label>
                <select
                  id="product"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Choose a product</option>
                  {selectedOrder.items.map((item) => (
                    <option key={item.product_id} value={item.product_id}>
                      {item.product_name} - ₹{item.price.toLocaleString()} (Qty: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Return Reason */}
            <div>
              <Label htmlFor="reason">Reason for Return *</Label>
              <select
                id="reason"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select a reason</option>
                {returnReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Additional Details</Label>
              <Textarea
                id="description"
                value={returnDescription}
                onChange={(e) => setReturnDescription(e.target.value)}
                placeholder="Provide more details about your return request..."
                rows={4}
              />
            </div>

            {/* Info Box */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="font-semibold mb-2">Return Policy:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Returns accepted within 7 days of delivery</li>
                <li>• Product must be unused and in original packaging</li>
                <li>• Refund will be processed within 5-7 business days</li>
                <li>• Return shipping costs may apply</li>
              </ul>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseCreateDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Return Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
