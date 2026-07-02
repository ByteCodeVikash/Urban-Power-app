import { create } from 'zustand';

export interface ScrapItem {
  id: string;
  category_id: string;
  name: string;
  price_per_kg: number;
  image?: string;
  description?: string;
  active: boolean;
}

export interface ScrapSelectionItem {
  id: string;
  category_id: string;
  name: string;
  price_per_kg: number;
  image?: string;
  description?: string;
  quantity: number; // Selected weight in kgs
}

interface ScrapSelectionState {
  selectedItems: ScrapSelectionItem[];
  addItem: (item: ScrapItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearSelection: () => void;
  totalEstimatedPrice: () => number;
  totalWeight: () => number;
}

export const useScrapSelectionStore = create<ScrapSelectionState>(
  (set, get) => ({
    selectedItems: [],

    addItem: (item, quantity = 1) => {
      set(state => {
        const existing = state.selectedItems.find(i => i.id === item.id);
        if (existing) {
          return {
            selectedItems: state.selectedItems.map(i =>
              i.id === item.id
                ? { ...i, quantity: Math.max(0, i.quantity + quantity) }
                : i,
            ),
          };
        }
        return {
          selectedItems: [
            ...state.selectedItems,
            {
              id: item.id,
              category_id: item.category_id,
              name: item.name,
              price_per_kg: item.price_per_kg,
              image: item.image,
              description: item.description,
              quantity: quantity,
            },
          ],
        };
      });
    },

    removeItem: itemId => {
      set(state => ({
        selectedItems: state.selectedItems.filter(item => item.id !== itemId),
      }));
    },

    updateQuantity: (itemId, delta) => {
      set(state => {
        const updated = state.selectedItems
          .map(item => {
            if (item.id === itemId) {
              const newQty = Math.max(0, item.quantity + delta);
              return { ...item, quantity: newQty };
            }
            return item;
          })
          .filter(i => i.quantity > 0);
        return { selectedItems: updated };
      });
    },

    clearSelection: () => set({ selectedItems: [] }),

    totalEstimatedPrice: () => {
      return get().selectedItems.reduce(
        (total, item) => total + item.price_per_kg * item.quantity,
        0,
      );
    },

    totalWeight: () => {
      return get().selectedItems.reduce(
        (total, item) => total + item.quantity,
        0,
      );
    },
  }),
);
