import { create } from 'zustand';

export interface BeauticianService {
  id: string;
  category_id: string;
  name: string;
  image?: string;
  description?: string;
  duration?: number;
  price: number;
  active: boolean;
}

interface BeauticianStoreState {
  selectedServices: BeauticianService[];
  addService: (service: BeauticianService) => void;
  removeService: (serviceId: string) => void;
  clearSelection: () => void;
  getSelectedCount: () => number;
  getTotalPrice: () => number;
}

export const useBeauticianStore = create<BeauticianStoreState>((set, get) => ({
  selectedServices: [],
  addService: service => {
    set(state => {
      const exists = state.selectedServices.some(s => s.id === service.id);
      if (exists) return state;
      return { selectedServices: [...state.selectedServices, service] };
    });
  },
  removeService: serviceId => {
    set(state => ({
      selectedServices: state.selectedServices.filter(s => s.id !== serviceId),
    }));
  },
  clearSelection: () => set({ selectedServices: [] }),
  getSelectedCount: () => get().selectedServices.length,
  getTotalPrice: () =>
    get().selectedServices.reduce((sum, service) => sum + service.price, 0),
}));
