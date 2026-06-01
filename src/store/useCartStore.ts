import { create } from 'zustand';

export interface ProductItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  category: string;
  quantity: number;
}

interface CartState {
  items: ProductItem[];
  addProduct: (product: any) => void;
  removeProduct: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalItemsCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addProduct: (product) => {
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { 
        items: [...state.items, { 
          id: product.id, 
          title: product.title, 
          price: product.price, 
          image: product.image,
          category: product.category,
          quantity: 1 
        }] 
      };
    });
  },
  removeProduct: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
  updateQuantity: (id, delta) => {
    set((state) => {
      const updated = state.items.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(i => i.quantity > 0);
      return { items: updated };
    });
  },
  clearCart: () => set({ items: [] }),
  totalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  totalItemsCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
}));
