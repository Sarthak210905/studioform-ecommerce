import { api } from '@/lib/axios';
import type { Product } from '@/types';

export const productService = {
  async getProducts(params?: {
    skip?: number;
    limit?: number;
    category?: string;
    brand?: string;
    tag?: string;
    collection?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    sort_order?: string;
  }) {
    const { data } = await api.get('/products/', { params });
    return data;
  },

  async getCollections(): Promise<string[]> {
    const { data } = await api.get('/products/collections');
    return data.collections || [];
  },

  async getProduct(id: string): Promise<Product> {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const { data } = await api.get('/products/featured', { params: { limit } });
    return data;
  },

  async getCategories(): Promise<string[]> {
    const { data } = await api.get('/products/categories');
    return data.categories || data;
  },

  async getBrands(): Promise<string[]> {
    const { data } = await api.get('/products/brands');
    return data;
  },

  async getRelatedProducts(productId: string, limit: number = 6) {
    const { data } = await api.get(`/products/${productId}/related`, { params: { limit } });
    return data;
  },

  async trackView(productId: string) {
    const { data } = await api.post(`/products/${productId}/view`);
    return data;
  },

  async getRecentlyViewed(limit: number = 10) {
    const { data } = await api.get('/products/recently-viewed/me', { params: { limit } });
    return data;
  },

  // Admin methods
  async createProduct(productData: any) {
    const { data } = await api.post('/products/', productData);
    return data;
  },

  async updateProduct(id: string, productData: any) {
    const { data } = await api.put(`/products/${id}`, productData);
    return data;
  },

  async deleteProduct(id: string) {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },
};
