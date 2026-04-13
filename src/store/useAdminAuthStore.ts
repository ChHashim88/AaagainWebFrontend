'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

interface AdminAuthStore {
  user: AdminUser | null;
  login: (userData: AdminUser) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthStore>()(
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
    { name: 'adminInfo' } // Strictly separated from 'userInfo'
  )
);
