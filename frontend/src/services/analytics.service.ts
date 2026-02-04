import { api } from '@/lib/axios';

export interface SalesSummary {
  period_days: number;
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  status_breakdown: Record<string, number>;
  daily_revenue: Record<string, number>;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
  current_stock: number;
  image: string;
}

export interface LowStockProduct {
  product_id: string;
  name: string;
  current_stock: number;
  price: number;
  image: string;
}

export interface CustomerStats {
  total_registered: number;
  customers_with_orders: number;
  average_customer_lifetime_value: number;
  top_customers: Array<{
    user_id: string;
    total_spent: number;
  }>;
}

export interface OrderStats {
  total_orders: number;
  by_status: Record<string, number>;
  by_payment_method: Record<string, number>;
  by_payment_status: Record<string, number>;
}

export interface RevenueByPeriod {
  period: string;
  data: Record<string, number>;
}

const analyticsService = {
  getSalesSummary: async (days: number = 30): Promise<SalesSummary> => {
    const response = await api.get(`/analytics/sales-summary?days=${days}`);
    return response.data;
  },

  getTopProducts: async (limit: number = 10): Promise<{ top_products: TopProduct[] }> => {
    const response = await api.get(`/analytics/top-products?limit=${limit}`);
    return response.data;
  },

  getLowStockProducts: async (threshold: number = 10): Promise<{ threshold: number; count: number; products: LowStockProduct[] }> => {
    const response = await api.get(`/analytics/low-stock?threshold=${threshold}`);
    return response.data;
  },

  getCustomerStats: async (): Promise<CustomerStats> => {
    const response = await api.get('/analytics/customer-stats');
    return response.data;
  },

  getOrderStats: async (): Promise<OrderStats> => {
    const response = await api.get('/analytics/order-stats');
    return response.data;
  },

  getRevenueByPeriod: async (period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<RevenueByPeriod> => {
    const response = await api.get(`/analytics/revenue-by-period?period=${period}`);
    return response.data;
  },
};

export default analyticsService;
