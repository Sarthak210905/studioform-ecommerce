import { api } from '@/lib/axios';

export interface RecentlyViewedProduct {
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_price: number;
  viewed_at: string;
}

export interface PriceAlert {
  alert_id: string;
  product_id: string;
  product_name: string;
  current_price: number;
  alert_price: number;
  price_dropped: boolean;
  created_at: string;
}

export interface ProductRecommendation {
  id: string;
  name: string;
  price: number;
  final_price: number;
  images: string[];
  category: string;
  discount_percentage: number;
}

export const trackingService = {
  // Track product view
  trackView: async (productId: string) => {
    try {
      await api.post(`/tracking/recently-viewed/${productId}`);
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  },

  // Get recently viewed products
  getRecentlyViewed: async (limit: number = 10) => {
    try {
      const { data } = await api.get<{ items: RecentlyViewedProduct[] }>(
        `/tracking/recently-viewed?limit=${limit}`
      );
      return data.items;
    } catch (error: any) {
      // Return empty array if user is not authenticated
      if (error.response?.status === 401) {
        return [];
      }
      throw error;
    }
  },

  // Create price alert
  createPriceAlert: async (productId: string, alertPrice: number) => {
    const { data } = await api.post(`/tracking/price-alerts/${productId}`, null, {
      params: { alert_price: alertPrice }
    });
    return data;
  },

  // Get price alerts
  getPriceAlerts: async () => {
    try {
      const { data } = await api.get<{ alerts: PriceAlert[] }>('/tracking/price-alerts');
      return data.alerts;
    } catch (error: any) {
      // Return empty array if user is not authenticated
      if (error.response?.status === 401) {
        return [];
      }
      throw error;
    }
  },
try {
      const { data } = await api.get<{ recommendations: ProductRecommendation[] }>(
        `/tracking/recommendations/${productId}?limit=${limit}`
      );
      return data.recommendations;
    } catch (error: any) {
      // Return empty array if user is not authenticated
      if (error.response?.status === 401) {
        return [];
      }
      throw error;
    }price-alerts/${alertId}`);
  },

  // Get product recommendations
  getRecommendations: async (productId: string, limit: number = 6) => {
    const { data } = await api.get<{ recommendations: ProductRecommendation[] }>(
      `/tracking/recommendations/${productId}?limit=${limit}`
    );
    return data.recommendations;
  }
};

// Analytics Service
export const analyticsService = {
  // Export orders to CSV
  exportOrders: async (days: number = 30) => {
    const response = await api.get(`/analytics/export/orders-csv?days=${days}`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Export products to CSV
  exportProducts: async () => {
    const response = await api.get('/analytics/export/products-csv', {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Get sales by category
  getSalesByCategory: async (days: number = 30) => {
    const { data } = await api.get(`/analytics/sales/by-category?days=${days}`);
    return data.categories;
  },

  // Get top products
  getTopProducts: async (limit: number = 10) => {
    const { data } = await api.get(`/analytics/top-products?limit=${limit}`);
    return data.top_products;
  },

  // Get sales summary
  getSalesSummary: async (days: number = 30) => {
    const { data } = await api.get(`/analytics/sales-summary?days=${days}`);
    return data;
  }
};
