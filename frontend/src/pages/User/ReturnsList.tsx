import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import returnService, { type ReturnRequest } from '@/services/return.service';
import { useToast } from '@/hooks/use-toast';
import { PackageX, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function UserReturns() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      const data = await returnService.getMyReturns();
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Product Exchanges</h1>
        <p className="text-gray-600">Manage your exchange requests for defective products</p>
      </div>

      {returns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <PackageX className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Returns Yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't requested any exchanges yet
            </p>
            <Button onClick={() => navigate('/orders')}>View Orders</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {returns.map((returnRequest) => (
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
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-medium">{returnRequest.order_id}</p>
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
                    <p className="text-sm">{returnRequest.reason}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Items</p>
                    <div className="space-y-2">
                      {returnRequest.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm">{item.product_name}</span>
                          <span className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {returnRequest.images && returnRequest.images.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Attached Images</p>
                      <div className="grid grid-cols-4 gap-2">
                        {returnRequest.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
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
