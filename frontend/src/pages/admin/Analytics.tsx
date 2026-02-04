import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import analyticsService, {
  type SalesSummary,
  type TopProduct,
  type LowStockProduct,
  type CustomerStats,
  type OrderStats,
} from '@/services/analytics.service';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  AlertTriangle,
  BarChart3,
  Calendar,
  IndianRupee
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


export default function Analytics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  
  // State for all analytics data
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [sales, products, stock, customers, orders] = await Promise.all([
        analyticsService.getSalesSummary(parseInt(period)),
        analyticsService.getTopProducts(10),
        analyticsService.getLowStockProducts(10),
        analyticsService.getCustomerStats(),
        analyticsService.getOrderStats(),
      ]);

      setSalesSummary(sales);
      setTopProducts(products.top_products);
      setLowStock(stock.products);
      setCustomerStats(customers);
      setOrderStats(orders);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to load analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive business insights and metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalytics} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Sales Summary */}
      {salesSummary && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-5 w-5" />
                  <p className="text-2xl font-bold">
                    {salesSummary.total_revenue.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{salesSummary.total_orders}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Order Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-5 w-5" />
                  <p className="text-2xl font-bold">
                    {salesSummary.average_order_value.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {Object.entries(salesSummary.status_breakdown).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span className="capitalize">{status}:</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Top Products & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Selling Products
            </CardTitle>
            <CardDescription>Best performing products by quantity sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.product_id} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center font-bold text-primary">
                      #{index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.quantity_sold} units sold • ₹{product.revenue.toLocaleString()} revenue
                    </p>
                  </div>
                  <Badge variant={product.current_stock > 10 ? 'default' : 'destructive'}>
                    Stock: {product.current_stock}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Products that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                All products are well stocked! 🎉
              </p>
            ) : (
              <div className="space-y-4">
                {lowStock.map((product) => (
                  <div key={product.product_id} className="flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{product.price.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {product.current_stock} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer & Order Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Stats */}
        {customerStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Registered</p>
                  <p className="text-2xl font-bold">{customerStats.total_registered}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">With Orders</p>
                  <p className="text-2xl font-bold">{customerStats.customers_with_orders}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Average Customer Lifetime Value
                </p>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-5 w-5" />
                  <p className="text-2xl font-bold">
                    {customerStats.average_customer_lifetime_value.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Stats */}
        {orderStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">By Status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(orderStats.by_status).map(([status, count]) => (
                    <Badge key={status} variant="outline">
                      {status}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">By Payment Method</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(orderStats.by_payment_method).map(([method, count]) => (
                    <Badge key={method} variant="secondary">
                      {method || 'N/A'}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">By Payment Status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(orderStats.by_payment_status).map(([status, count]) => (
                    <Badge
                      key={status}
                      variant={status === 'paid' ? 'default' : 'outline'}
                    >
                      {status}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
