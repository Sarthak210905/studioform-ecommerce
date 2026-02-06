import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCartStore } from './cartStore';

interface User {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  role: string;
  is_superuser: boolean;
  is_active: boolean;
  is_verified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: () => boolean;
  login: (user: User, token: string) => void;
  register: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: () => {
        const state = get();
        return !!state.token && !!state.user;
      },
      login: (user, token) => {
        set({ user, token });
      },
      register: (user, token) => {
        set({ user, token });
      },
      logout: () => {
        set({ user: null, token: null });
        // Clear cart local state to prevent data leaking to next user
        // Use setState directly to avoid the backend API call in clearCart()
        useCartStore.setState({
          items: [],
          total: 0,
          cart: { items: [], total: 0, total_price: 0, total_items: 0 },
        });
      },
      updateUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
