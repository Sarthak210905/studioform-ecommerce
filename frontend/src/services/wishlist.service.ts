import { api } from '@/lib/axios';
import type { WishlistItem } from '@/types';

export const wishlistService = {
  async getWishlist(): Promise<WishlistItem[]> {
    const { data } = await api.get('/wishlist/');
    return data;
  },

  async addToWishlist(productId: string): Promise<WishlistItem> {
    const { data } = await api.post('/wishlist/add', { product_id: productId });
    return data;
  },

  async removeFromWishlist(productId: string) {
    await api.delete(`/wishlist/${productId}`);
  },

  async checkInWishlist(productId: string): Promise<boolean> {
    const { data } = await api.get(`/wishlist/check/${productId}`);
    return data.in_wishlist;
  },

  async clearWishlist() {
    await api.delete('/wishlist/');
  },
};
