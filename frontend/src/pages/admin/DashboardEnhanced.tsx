import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/axios';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  Plus,
  Eye,
  AlertCircle,
  RotateCcw,
  BarChart3,
  Truck,
  Image as ImageIcon,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Gift,
  MapPin,
  Settings,
  Mail,
  Loader2
} from 'lucide-react';

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

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  link?: string;
}

export default function AdminDashboardEnhanced() {
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

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string; icon: string } } = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
      green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' },
      red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
    };
    return colors[color] || colors['blue'];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const statCards: StatCard[] = stats ? [
    {
      title: 'Total Revenue',
      value: `₹${stats.total_revenue.toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5" />,
      trend: {
        value: stats.recent_revenue || 0,
        isPositive: (stats.recent_revenue || 0) > 0,
        label: 'This week'
      },
      color: 'blue',
      link: '/admin/analytics'
    },
    {
      title: 'Total Orders',
      value: stats.total_orders,
      icon: <ShoppingCart className="h-5 w-5" />,
      trend: {
        value: stats.recent_orders || 0,
        isPositive: (stats.recent_orders || 0) > 0,
        label: 'This week'
      },
      color: 'green',
      link: '/admin/orders'
    },
    {
      title: 'Active Customers',
      value: stats.total_customers,
      icon: <Users className="h-5 w-5" />,
      color: 'purple',
      link: '/admin/users'
    },
    {
      title: 'Total Products',
      value: stats.total_products,
      icon: <Package className="h-5 w-5" />,
      color: 'orange',
      link: '/admin/products'
    }
  ] : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Monitor your store performance and key metrics</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/orders">
              <Eye className="mr-2 h-4 w-4" />
              Orders
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/products">
              <Package className="mr-2 h-4 w-4" />
              Products
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/admin/products/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          return (
            <Link key={index} to={stat.link || '#'} className="block">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`${colors.bg} p-2 rounded-lg`}>
                    <div className={colors.icon}>{stat.icon}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.trend && (
                    <div className="flex items-center text-xs gap-1">
                      {stat.trend.isPositive ? (
                        <ArrowUpRight className="h-3 w-3 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                      )}
                      <span className={stat.trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                        {stat.trend.isPositive ? '+' : ''}{stat.trend.value.toLocaleString()} {stat.trend.label}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-green-500" />
                  Recent Orders
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/orders">
                  View All
                  <Eye className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{order.order_number}</span>
                          <Badge variant="outline" className="text-xs">
                            {order.items_count} items
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{order.user_name}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-semibold">₹{order.total_amount.toLocaleString()}</p>
                        <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                          {order.status || 'pending'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent orders
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Low Stock Alert */}
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-white rounded border border-orange-100">
                      <div className="text-sm flex-1">
                        <p className="font-medium text-orange-900">{product.name}</p>
                        <p className="text-xs text-orange-700">{product.stock} in stock</p>
                      </div>
                      <Link to={`/admin/products`}>
                        <Button size="sm" variant="ghost">
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-orange-800">All products well stocked ✓</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/products/add">
                  <Plus className="mr-2 h-4 w-4" />
                  New Product
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/coupons">
                  <Gift className="mr-2 h-4 w-4" />
                  Create Coupon
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/newsletter">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Newsletter
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/banners">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Manage Banners
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/shipping">
                  <Truck className="mr-2 h-4 w-4" />
                  Shipping Zones
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800 mb-3">
                View detailed analytics and business insights
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                <Link to="/admin/analytics">
                  Open Analytics
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-500" />
              Email Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              Order confirmations, shipping updates, and more
            </p>
            <Button size="sm" variant="ghost" className="mt-3" asChild>
              <Link to="/admin/settings">
                Configure
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              GA4 Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Connected</div>
            <p className="text-xs text-muted-foreground mt-1">
              ID: G-ZTBWB3Q6F4
            </p>
            <Button size="sm" variant="ghost" className="mt-3" asChild>
              <Link to="/admin/settings">
                View Config
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              Shipping Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹150</div>
            <p className="text-xs text-muted-foreground mt-1">
              Flat rate, FREE &gt; ₹1499
            </p>
            <Button size="sm" variant="ghost" className="mt-3" asChild>
              <Link to="/admin/settings">
                Update Rates
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
