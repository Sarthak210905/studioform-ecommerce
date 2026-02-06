import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/axios';

interface WishlistItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  is_active: boolean;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  addItem: (item: WishlistItem) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  fetchWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      fetchWishlist: async () => {
        try {
          set({ loading: true });
          const { data } = await api.get('/wishlist/');
          const items: WishlistItem[] = (data || []).map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            name: item.product_name,
            price: item.final_price ?? item.product_price,
            image_url: item.image_url || '',
            category: '',
            is_active: item.in_stock ?? true,
          }));
          set({ items });
        } catch {
          // If not logged in or API error, keep local items
        } finally {
          set({ loading: false });
        }
      },

      addItem: async (item) => {
        const items = get().items;
        const exists = items.some((i) => i.product_id === item.product_id);
        if (exists) return;

        // Optimistically add locally
        set({ items: [...items, item] });

        try {
          await api.post('/wishlist/add', { product_id: item.product_id });
        } catch {
          // If backend fails (e.g. not logged in), keep local item anyway
        }
      },

      removeItem: async (productId) => {
        // Optimistically remove locally
        set({ items: get().items.filter((i) => i.product_id !== productId) });

        try {
          await api.delete(`/wishlist/${productId}`);
        } catch {
          // If backend fails, local removal still stands
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.product_id === productId);
      },

      clearWishlist: () => {
        set({ items: [] });
        api.delete('/wishlist/').catch(() => {});
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);

