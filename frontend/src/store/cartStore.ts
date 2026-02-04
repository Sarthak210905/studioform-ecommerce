import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/axios';

interface CartItem {
  id: string;
  product_id: string;
  product_name: string; // Changed from 'name'
  product_price: number; // Changed from 'price'
  quantity: number;
  image_url: string;
  stock_quantity: number;
  subtotal: number; // Added
}

interface Cart {
  items: CartItem[];
  total: number;
  total_price: number; // Added
  total_items: number; // Changed from itemCount
}

interface CartState {
  items: CartItem[];
  total: number;
  cart: Cart;
  loading: boolean; // Added
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItem: (productId: string, quantity: number) => void; // Added
  clearCart: () => void;
  calculateTotal: () => void;
  fetchCart: () => Promise<void>;
  syncCartToBackend: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      loading: false,
      cart: {
        items: [],
        total: 0,
        total_price: 0,
        total_items: 0,
      },
      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.product_id === item.product_id);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.product_id === item.product_id
                ? { 
                    ...i, 
                    quantity: i.quantity + item.quantity,
                    subtotal: (i.quantity + item.quantity) * i.product_price
                  }
                : i
            ),
          });
        } else {
          set({ 
            items: [...items, {
              ...item,
              subtotal: item.quantity * item.product_price
            }] 
          });
        }
        get().calculateTotal();
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.product_id !== productId) });
        get().calculateTotal();
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product_id === productId 
              ? { 
                  ...i, 
                  quantity,
                  subtotal: quantity * i.product_price
                } 
              : i
          ),
        });
        get().calculateTotal();
      },
      updateItem: (productId, quantity) => {
        // Alias for updateQuantity
        get().updateQuantity(productId, quantity);
      },
      clearCart: () => {
        set({ 
          items: [], 
          total: 0,
          cart: {
            items: [],
            total: 0,
            total_price: 0,
            total_items: 0,
          }
        });
        // Also clear backend cart
        api.delete('/cart/').catch(err => console.error('Failed to clear backend cart:', err));
      },
      calculateTotal: () => {
        const items = get().items;
        // Use subtotal field which already includes quantity * final_price
        const total = items.reduce(
          (sum, item) => sum + item.subtotal,
          0
        );
        const total_items = items.reduce((sum, item) => sum + item.quantity, 0);
        
        set({ 
          total,
          cart: {
            items,
            total,
            total_price: total,
            total_items,
          }
        });
      },
      fetchCart: async () => {
        set({ loading: true });
        try {
          // This would typically fetch cart from API
          // For now, just recalculate from existing items
          get().calculateTotal();
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        } finally {
          set({ loading: false });
        }
      },
      syncCartToBackend: async () => {
        const items = get().items;
        try {
          // First, clear the backend cart to avoid duplicates
          await api.delete('/cart/');
          
          // Then add all items with exact quantities
          for (const item of items) {
            await api.post('/cart/add', {
              product_id: item.product_id,
              quantity: item.quantity,
            });
          }
        } catch (error) {
          console.error('Failed to sync cart to backend:', error);
          throw error;
        }
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
