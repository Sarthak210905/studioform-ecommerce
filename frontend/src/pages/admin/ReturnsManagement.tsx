import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import returnService, { type ReturnRequest } from '@/services/return.service';
import { PackageX, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AdminReturnsManagement() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      const data = await returnService.getAllReturns();
      setReturns(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to load returns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (returnId: string, status: string) => {
    try {
      await returnService.updateReturnStatus(returnId, status);
      toast({ title: 'Return status updated successfully' });
      loadReturns();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <PackageX className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReturns = returns.filter((ret) => {
    if (filter === 'all') return true;
    return ret.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Product Exchanges</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Returns</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredReturns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <PackageX className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Returns Found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No return requests have been submitted yet'
                : `No ${filter} returns found`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReturns.map((returnRequest) => (
            <Card key={returnRequest.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(returnRequest.status)}
                    <span className="capitalize">{returnRequest.request_type} Request</span>
                  </CardTitle>
                  <Badge className={getStatusColor(returnRequest.status)}>
                    {returnRequest.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-medium">{returnRequest.order_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="font-medium">{returnRequest.user_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Request Date</p>
                      <p className="font-medium">
                        {new Date(returnRequest.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Reason</p>
                    <p className="text-sm bg-gray-50 p-3 rounded">{returnRequest.reason}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Items</p>
                    <div className="space-y-2">
                      {returnRequest.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded"
                        >
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">
                            {item.price != null
                              ? `₹${item.price.toLocaleString()}`
                              : '—'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {returnRequest.images && returnRequest.images.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Attached Images</p>
                      <div className="grid grid-cols-5 gap-2">
                        {returnRequest.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                            onClick={() => window.open(image, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {returnRequest.status === 'pending' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="default"
                        onClick={() => handleStatusUpdate(returnRequest.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusUpdate(returnRequest.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}

                  {returnRequest.status === 'approved' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => handleStatusUpdate(returnRequest.id, 'processing')}
                      >
                        Mark as Processing
                      </Button>
                    </div>
                  )}

                  {returnRequest.status === 'processing' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => handleStatusUpdate(returnRequest.id, 'completed')}
                      >
                        Mark as Completed
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
