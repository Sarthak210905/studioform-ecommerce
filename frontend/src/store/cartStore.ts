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
  loadAndMergeCart: () => Promise<void>; // Added for login sync
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
          // Fetch cart from backend API
          const response = await api.get('/cart/');
          const backendCart = response.data;
          
          if (backendCart && backendCart.items) {
            // Map backend cart items to frontend format
            const items = backendCart.items.map((item: any) => ({
              id: item.id || item.product_id,
              product_id: item.product_id,
              product_name: item.product_name,
              product_price: item.product_price,
              quantity: item.quantity,
              image_url: item.image_url,
              stock_quantity: item.stock_quantity || 999,
              subtotal: item.subtotal || (item.quantity * item.product_price),
            }));
            
            // Update store with backend cart
            set({ items });
            get().calculateTotal();
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error);
          // If fetch fails, keep local cart and try to sync it
          get().calculateTotal();
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
      loadAndMergeCart: async () => {
        set({ loading: true });
        try {
          const localItems = get().items;
          
          // Fetch backend cart
          const response = await api.get('/cart/');
          const backendCart = response.data;
          
          if (backendCart && backendCart.items && backendCart.items.length > 0) {
            // Backend has items, merge with local
            const backendItems = backendCart.items.map((item: any) => ({
              id: item.id || item.product_id,
              product_id: item.product_id,
              product_name: item.product_name,
              product_price: item.product_price,
              quantity: item.quantity,
              image_url: item.image_url,
              stock_quantity: item.stock_quantity || 999,
              subtotal: item.subtotal || (item.quantity * item.product_price),
            }));
            
            // Merge: prefer backend quantities, add local-only items
            const mergedMap = new Map();
            backendItems.forEach((item: any) => mergedMap.set(item.product_id, item));
            
            localItems.forEach((item) => {
              if (!mergedMap.has(item.product_id)) {
                mergedMap.set(item.product_id, item);
              }
            });
            
            const mergedItems = Array.from(mergedMap.values());
            set({ items: mergedItems });
            get().calculateTotal();
            
            // Sync merged cart back to backend
            if (localItems.length > 0) {
              await get().syncCartToBackend();
            }
          } else if (localItems.length > 0) {
            // No backend cart, sync local to backend
            await get().syncCartToBackend();
          }
        } catch (error) {
          console.error('Failed to merge cart:', error);
          get().calculateTotal();
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
