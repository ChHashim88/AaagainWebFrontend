'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

interface AuthStore {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      login: (userData) => {
        set({ user: userData });
      },
      logout: () => {
        set({ user: null });
      },
    }),
    { name: 'userInfo' }
  )
);
