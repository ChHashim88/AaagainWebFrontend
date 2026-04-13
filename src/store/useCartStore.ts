import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';

interface CartItem {
  id: string; // product id normally
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  stock?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string, size?: string, color?: string) => Promise<void>;
  updateQuantity: (id: string, size: string | undefined, color: string | undefined, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  syncCart: () => Promise<void>;
}

// In MVP, we mix local and remote. We keep Zustand local but try to push to API if user is logged in.
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: async (item) => {
        // Attempt API sync if token exists
        try {
          const authText = localStorage.getItem('userInfo');
          if (authText) {
            const user = JSON.parse(authText) as any;
            if (user?.state?.user?.token) {
              await axios.post(`${API_URL}/cart/add`, {
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
                size: item.size,
                color: item.color
              }, {
                headers: { Authorization: `Bearer ${user.state.user.token}` }
              });
            }
          }
        } catch (error) {
          console.error('API Cart error', error);
        }

        set((state) => {
          const existingItem = state.items.find(
            (i) => i.id === item.id && i.size === item.size && i.color === item.color
          );
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.size === item.size && i.color === item.color
                  ? { ...i, quantity: i.quantity + item.quantity, stock: item.stock }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },
      removeItem: async (id, size, color) => {
        // Simple local removal for MVP. To make it perfect with API, we would need the DB CartItem ID.
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.id === id && i.size === size && i.color === color)
          ),
        }));
      },
      updateQuantity: (id, size, color, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.size === size && i.color === color
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      syncCart: async () => {
        try {
          const authText = localStorage.getItem('userInfo');
          if (authText) {
            const user = JSON.parse(authText) as any;
            if (user?.state?.user?.token) {
              const { data } = await axios.get(`${API_URL}/cart`, {
                headers: { Authorization: `Bearer ${user.state.user.token}` }
              });
              
              if (data && data.items) {
                const mappedItems = data.items.map((dbItem: any) => ({
                  id: dbItem.productId,
                  name: dbItem.product.name,
                  price: dbItem.price,
                  image: dbItem.product.images[0] || '',
                  quantity: dbItem.quantity,
                  size: dbItem.size,
                  color: dbItem.color,
                  stock: dbItem.product.stock
                }));
                set({ items: mappedItems });
              }
            }
          }
        } catch (error) {
          console.error('Sync cart error', error);
        }
      }
    }),
    {
      name: 'aaagain-cart',
    }
  )
);
