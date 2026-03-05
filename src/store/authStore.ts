// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User } from '@/types/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      
      setUser: (user) => set({ user }),
      
      logout: () => {
        // Clear state and remove token from storage
        localStorage.removeItem('auth-storage');
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // Name of the item in localStorage
    }
  )
);

export default useAuthStore;