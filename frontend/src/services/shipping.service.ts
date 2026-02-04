import { api } from '@/lib/axios';

export interface ShippingZone {
  id: string;
  name: string;
  pincodes: string[];
  states: string[];
  base_charge: number;
  charge_per_kg: number;
  free_shipping_threshold: number;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
}

export interface CreateShippingZone {
  name: string;
  pincodes?: string[];
  states?: string[];
  base_charge: number;
  charge_per_kg: number;
  free_shipping_threshold: number;
  estimated_days_min: number;
  estimated_days_max: number;
}

export interface CalculateShippingRequest {
  pincode: string;
  state: string;
  subtotal: number;
  weight_kg?: number;
  payment_mode?: string;
  cod_amount?: number;
}

export interface ShippingCalculation {
  shipping_cost: number;
  free_shipping: boolean;
  zone_name: string;
  estimated_days: string;
}

const shippingService = {
  // Public API
  calculateShipping: async (data: CalculateShippingRequest): Promise<ShippingCalculation> => {
    const response = await api.post('/shipping/calculate', data);
    return response.data;
  },

  // Admin APIs
  getAllZones: async (): Promise<ShippingZone[]> => {
    const response = await api.get('/shipping/admin/zones');
    return response.data;
  },

  createZone: async (data: CreateShippingZone): Promise<ShippingZone> => {
    const response = await api.post('/shipping/admin/zones', data);
    return response.data;
  },

  updateZone: async (id: string, data: Partial<CreateShippingZone>): Promise<ShippingZone> => {
    const response = await api.put(`/shipping/admin/zones/${id}`, data);
    return response.data;
  },

  deleteZone: async (id: string): Promise<void> => {
    await api.delete(`/shipping/admin/zones/${id}`);
  },

  toggleZoneStatus: async (id: string): Promise<ShippingZone> => {
    const response = await api.patch(`/shipping/admin/zones/${id}/toggle`);
    return response.data;
  },
};

export default shippingService;
