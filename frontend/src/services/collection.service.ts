import { api } from '@/lib/axios';

export interface Collection {
  id: string;
  name: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  banner_image: string | null;
  icon_name: string;
  gradient: string;
  accent_color: string;
  bg_pattern: string;
  is_active: boolean;
  position: number;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionCreate {
  name: string;
  title: string;
  subtitle?: string;
  description?: string;
  banner_image?: string | null;
  icon_name?: string;
  gradient?: string;
  accent_color?: string;
  bg_pattern?: string;
  is_active?: boolean;
  position?: number;
}

export interface CollectionUpdate extends Partial<CollectionCreate> {}

export const collectionService = {
  // Public
  async getCollections(): Promise<Collection[]> {
    const { data } = await api.get('/collections/');
    return data.collections || [];
  },

  // Admin
  async getAllCollections(): Promise<Collection[]> {
    const { data } = await api.get('/collections/all');
    return data.collections || [];
  },

  async getCollection(id: string): Promise<Collection> {
    const { data } = await api.get(`/collections/${id}`);
    return data;
  },

  async getCollectionProducts(id: string, params?: { skip?: number; limit?: number; sort_by?: string; sort_order?: string }) {
    const { data } = await api.get(`/collections/${id}/products`, { params });
    return data;
  },

  async createCollection(collectionData: CollectionCreate): Promise<Collection> {
    const { data } = await api.post('/collections/', collectionData);
    return data;
  },

  async updateCollection(id: string, updates: CollectionUpdate): Promise<Collection> {
    const { data } = await api.put(`/collections/${id}`, updates);
    return data;
  },

  async deleteCollection(id: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/collections/${id}`);
    return data;
  },

  async addProductToCollection(collectionId: string, productId: string) {
    const { data } = await api.post(`/collections/${collectionId}/products/${productId}`);
    return data;
  },

  async removeProductFromCollection(collectionId: string, productId: string) {
    const { data } = await api.delete(`/collections/${collectionId}/products/${productId}`);
    return data;
  },

  async seedDefaults() {
    const { data } = await api.post('/collections/seed-defaults');
    return data;
  },
};
