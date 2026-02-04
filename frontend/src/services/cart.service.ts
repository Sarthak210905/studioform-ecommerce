import { api } from '@/lib/axios';
import type { CartSummary, CartItem } from '@/types';

export const cartService = {
  async getCart(): Promise<CartSummary> {
    const { data } = await api.get('/cart/');
    return data;
  },

  async addToCart(productId: string, quantity: number = 1): Promise<CartItem> {
    const { data } = await api.post('/cart/add', { product_id: productId, quantity });
    return data;
  },

  async updateCartItem(itemId: string, quantity: number): Promise<CartItem> {
    const { data } = await api.put(`/cart/${itemId}`, { quantity });
    return data;
  },

  async removeFromCart(itemId: string) {
    await api.delete(`/cart/${itemId}`);
  },

  async clearCart() {
    await api.delete('/cart/');
  },
};
