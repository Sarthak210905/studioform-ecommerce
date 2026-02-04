import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Loader2,
  X,
  PackageX,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';

interface ReturnRequest {
  id: string;
  order_id: string;
  order_number: string;
  user_id: string;
  user_name: string;
  user_email: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  reason: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  refund_amount: number;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminReturns() {
  const { toast } = useToast();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      const response = await api.get('/admin/returns/');
      setReturns(response.data);
    } catch (error) {
      console.error('Failed to load returns:', error);
      toast({
        title: 'Error',
        description: 'Failed to load return requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (returnRequest: ReturnRequest) => {
    setSelectedReturn(returnRequest);
    setDetailsDialogOpen(true);
  };

  const handleOpenActionDialog = (
    returnRequest: ReturnRequest,
    action: 'approve' | 'reject'
  ) => {
    setSelectedReturn(returnRequest);
    setActionType(action);
    setRefundAmount(returnRequest.refund_amount.toString());
    setAdminNotes('');
    setActionDialogOpen(true);
  };

  const handleCloseActionDialog = () => {
    setActionDialogOpen(false);
    setSelectedReturn(null);
    setActionType(null);
    setAdminNotes('');
    setRefundAmount('');
  };

  const handleSubmitAction = async () => {
    if (!selectedReturn || !actionType) return;

    setSubmitting(true);
    try {
      const endpoint =
        actionType === 'approve'
          ? `/admin/returns/${selectedReturn.id}/approve`
          : `/admin/returns/${selectedReturn.id}/reject`;

      await api.put(endpoint, {
        admin_notes: adminNotes,
        refund_amount: actionType === 'approve' ? parseFloat(refundAmount) : 0,
      });

      toast({
        title: 'Success',
        description: `Return request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`,
      });

      loadReturns();
      handleCloseActionDialog();
      setDetailsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update return request',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (returnId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/returns/${returnId}/status`, { status: newStatus });
      toast({
        title: 'Success',
        description: 'Return status updated successfully',
      });
      loadReturns();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
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

  const filteredReturns = returns.filter((item) => {
    const matchesSearch =
      item.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Return Requests</h1>
        <p className="text-muted-foreground">
          Review and manage customer return requests
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order, customer, or product..."
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

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{returns.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {returns.filter((r) => r.status === 'pending').length}
            </p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {returns.filter((r) => r.status === 'approved').length}
            </p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {returns.filter((r) => r.status === 'processing').length}
            </p>
            <p className="text-xs text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {returns.filter((r) => r.status === 'rejected').length}
            </p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Returns List */}
      {filteredReturns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <PackageX className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || statusFilter !== 'all'
                ? 'No returns found'
                : 'No return requests yet'}
            </h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Return requests will appear here when customers submit them'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReturns.map((returnItem) => (
            <Card key={returnItem.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Product Image */}
                  <img
                    src={returnItem.product_image}
                    alt={returnItem.product_name}
                    className="w-full lg:w-32 h-32 object-cover rounded-lg"
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
                        <p className="text-sm text-muted-foreground">
                          Customer: {returnItem.user_name}
                        </p>
                      </div>
                      <Badge className={getStatusColor(returnItem.status)}>
                        {returnItem.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Requested on{' '}
                        {new Date(returnItem.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(returnItem)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View Details
                        </Button>

                        {returnItem.status === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() =>
                                handleOpenActionDialog(returnItem, 'approve')
                              }
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleOpenActionDialog(returnItem, 'reject')}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Reject
                            </Button>
                          </>
                        )}

                        {returnItem.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(returnItem.id, 'processing')
                            }
                          >
                            Mark as Processing
                          </Button>
                        )}

                        {returnItem.status === 'processing' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(returnItem.id, 'completed')
                            }
                          >
                            Mark as Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Return Request Details</DialogTitle>
          </DialogHeader>

          {selectedReturn && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Order Number</Label>
                  <p className="text-sm font-medium">{selectedReturn.order_number}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedReturn.status)}>
                    {selectedReturn.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Customer Information</Label>
                <p className="text-sm">{selectedReturn.user_name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedReturn.user_email}
                </p>
              </div>

              <div>
                <Label>Product</Label>
                <div className="flex gap-3 items-center mt-2">
                  <img
                    src={selectedReturn.product_image}
                    alt={selectedReturn.product_name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm font-medium">{selectedReturn.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {selectedReturn.quantity} × ₹{selectedReturn.price}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Return Reason</Label>
                <p className="text-sm">{selectedReturn.reason}</p>
              </div>

              {selectedReturn.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm">{selectedReturn.description}</p>
                </div>
              )}

              {selectedReturn.admin_notes && (
                <div>
                  <Label>Admin Notes</Label>
                  <p className="text-sm">{selectedReturn.admin_notes}</p>
                </div>
              )}

              <div>
                <Label>Refund Amount</Label>
                <p className="text-lg font-bold">
                  ₹{selectedReturn.refund_amount.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog (Approve/Reject) */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Return Request
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Confirm the refund amount and add any notes'
                : 'Provide a reason for rejection'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === 'approve' && (
              <div>
                <Label htmlFor="refund_amount">Refund Amount (₹) *</Label>
                <Input
                  id="refund_amount"
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="admin_notes">
                {actionType === 'approve' ? 'Admin Notes' : 'Rejection Reason *'}
              </Label>
              <Textarea
                id="admin_notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                placeholder={
                  actionType === 'approve'
                    ? 'Add any internal notes...'
                    : 'Explain why this return is being rejected...'
                }
                required={actionType === 'reject'}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseActionDialog}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleSubmitAction}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : actionType === 'approve' ? (
                'Approve Return'
              ) : (
                'Reject Return'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
