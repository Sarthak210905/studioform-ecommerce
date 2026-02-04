import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp,
  Plus,
  Eye,
  AlertCircle,
  Clock,
  Tag,
  RotateCcw,
  BarChart3,
  Truck,
  Mail,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '@/lib/axios';

interface Stats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  recent_orders?: number;
  recent_revenue?: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  user_name: string;
  total_amount: number;
  items_count: number;
  status?: string;
  created_at?: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  category?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load stats
      const statsData = await api.get('/admin/stats');
      setStats(statsData.data);

      // Load recent orders
      const ordersData = await api.get('/orders/admin/all');
      setRecentOrders(ordersData.data.slice(0, 5));

      // Load low stock products
      const productsData = await api.get('/products/', { 
        params: { limit: 100 } 
      });
      const products = productsData.data.products || productsData.data;
      const lowStock = products.filter((p: any) => p.stock > 0 && p.stock <= 10);
      setLowStockProducts(lowStock.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/orders">
              <Eye className="mr-2 h-4 w-4" />
              View Orders
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/banners">
              <ImageIcon className="mr-2 h-4 w-4" />
              Banners
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/products/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.total_revenue.toLocaleString()}</div>
              {stats.recent_revenue !== undefined && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {stats.recent_revenue > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-500">
                        ₹{stats.recent_revenue.toLocaleString()} this week
                      </span>
                    </>
                  ) : (
                    <span>No sales this week</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_orders}</div>
              {stats.recent_orders !== undefined && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{stats.recent_orders} orders this week</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_customers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active customers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_products}</div>
              <Button variant="link" className="h-auto p-0 text-xs mt-1" asChild>
                <Link to="/admin/products">Manage products →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{order.order_number}</p>
                        {order.status && (
                          <Badge className={getStatusColor(order.status)} variant="secondary">
                            {order.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.user_name || 'Customer'} • {order.items_count} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">₹{order.total_amount.toLocaleString()}</p>
                      {order.created_at && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Low Stock Alert</CardTitle>
              {lowStockProducts.length > 0 && (
                <Badge variant="destructive" className="h-5">
                  {lowStockProducts.length}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/products">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>All products are well stocked</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category || 'Uncategorized'}</p>
                      </div>
                    </div>
                    <Badge variant={product.stock <= 5 ? "destructive" : "secondary"}>
                      {product.stock} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link to="/admin/products/add">
                <Plus className="h-6 w-6 mb-2" />
                <span>Add Product</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link to="/admin/orders">
                <ShoppingCart className="h-6 w-6 mb-2" />
                <span>Orders</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link to="/admin/users">
                <Users className="h-6 w-6 mb-2" />
                <span>Users</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link to="/admin/products">
                <Package className="h-6 w-6 mb-2" />
                <span>Products</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link to="/admin/coupons">
                <Tag className="h-6 w-6 mb-2" />
                <span>Coupons</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link to="/admin/returns">
                <RotateCcw className="h-6 w-6 mb-2" />
                <span>Exchanges</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link to="/admin/analytics">
                <BarChart3 className="h-6 w-6 mb-2" />
                <span>Analytics</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link to="/admin/shipping">
                <Truck className="h-6 w-6 mb-2" />
                <span>Shipping</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link to="/admin/settings">
                <Settings className="h-6 w-6 mb-2" />
                <span>Settings</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link to="/admin/newsletter">
                <Mail className="h-6 w-6 mb-2" />
                <span>Newsletter</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}