import { api } from '@/lib/axios';

export interface ReturnRequest {
  id: string;
  order_id: string;
  user_id: string;
  request_type: 'return' | 'exchange';
  reason: string;
  items: ReturnRequestItem[];
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  images?: string[];
  created_at: string;
  updated_at?: string;
}

export interface ReturnRequestItem {
  product_id: string;
  product_name: string;
  quantity: number;
  reason: string;
  price?: number;
}

export interface CreateReturnRequest {
  order_id: string;
  request_type: 'return' | 'exchange';
  reason: string;
  items: ReturnRequestItem[];
}

const returnService = {
  createReturnRequest: async (data: CreateReturnRequest): Promise<ReturnRequest> => {
    const response = await api.post('/returns/', data);
    return response.data;
  },

  getMyReturns: async (): Promise<ReturnRequest[]> => {
    const response = await api.get('/returns/my-returns');
    return response.data;
  },

  getReturnById: async (returnId: string): Promise<ReturnRequest> => {
    const response = await api.get(`/returns/${returnId}`);
    return response.data;
  },

  // Admin endpoints
  getAllReturns: async (): Promise<ReturnRequest[]> => {
    const response = await api.get('/returns/admin/all');
    return response.data;
  },

  updateReturnStatus: async (
    returnId: string,
    status: string,
    adminNotes?: string
  ): Promise<ReturnRequest> => {
    const response = await api.put(`/returns/${returnId}/status`, {
      status,
      admin_notes: adminNotes,
    });
    return response.data;
  },
};

export default returnService;
