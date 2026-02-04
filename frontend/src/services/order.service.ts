import { api } from '@/lib/axios';
import type { OrderResponse, OrderSummary, ShippingAddress } from '@/types';

export const orderService = {
  async getMyOrders(): Promise<OrderSummary[]> {
    const { data } = await api.get('/orders/');
    return data;
  },

  async getOrderDetails(orderId: string): Promise<OrderResponse> {
    const { data } = await api.get(`/orders/${orderId}`);
    return data;
  },

  async createOrder(orderData: {
    shipping_address: ShippingAddress;
    payment_method: 'cod' | 'razorpay';
    coupon_code?: string;
  }): Promise<OrderResponse> {
    const { data } = await api.post('/orders/', orderData);
    return data;
  },

  async cancelOrder(orderId: string): Promise<OrderResponse> {
    const { data } = await api.put(`/orders/${orderId}/cancel`);
    return data;
  },

  async downloadInvoice(orderId: string) {
    const { data } = await api.get(`/orders/${orderId}/invoice`, {
      responseType: 'blob',
    });
    return data;
  },
};
