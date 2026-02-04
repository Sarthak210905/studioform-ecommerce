import { api } from '@/lib/axios';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number;
  usage_limit: number;
  usage_count: number;
  per_user_limit: number;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
}

export interface CouponValidation {
  valid: boolean;
  message: string;
  discount_amount?: number;
  final_amount?: number;
}

const couponService = {
  getActiveCoupons: async (): Promise<Coupon[]> => {
    const response = await api.get('/coupons/');
    return response.data;
  },

  validateCoupon: async (code: string, subtotal: number): Promise<CouponValidation> => {
    const response = await api.post('/coupons/validate', {
      coupon_code: code,
      subtotal,
    });
    return response.data;
  },

  // Admin endpoints
  createCoupon: async (data: Partial<Coupon>): Promise<Coupon> => {
    const response = await api.post('/coupons/admin/create', data);
    return response.data;
  },

  getAllCoupons: async (): Promise<Coupon[]> => {
    const response = await api.get('/coupons/admin/all');
    return response.data;
  },

  updateCoupon: async (id: string, data: Partial<Coupon>): Promise<Coupon> => {
    const response = await api.put(`/coupons/admin/${id}`, data);
    return response.data;
  },

  deleteCoupon: async (id: string): Promise<void> => {
    await api.delete(`/coupons/admin/${id}`);
  },

  toggleCouponStatus: async (id: string): Promise<Coupon> => {
    const response = await api.put(`/coupons/admin/${id}/toggle`);
    return response.data;
  },
};

export default couponService;
