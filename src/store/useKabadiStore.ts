import { create } from 'zustand';

export interface PickupRequest {
  id: string;
  categories: string[];
  address: string;
  date: string;
  timeSlot: string;
  status: 'Requested' | 'Assigned' | 'In-Progress' | 'Completed' | 'Cancelled';
  estimatedValue?: string;
  image?: string;
}

interface KabadiState {
  pickups: PickupRequest[];
  schedulePickup: (pickup: Omit<PickupRequest, 'id' | 'status'>) => void;
  updatePickupStatus: (id: string, status: PickupRequest['status']) => void;
  getPickupById: (id: string) => PickupRequest | undefined;
}

export const useKabadiStore = create<KabadiState>((set, get) => ({
  pickups: [],
  schedulePickup: pickup => {
    set(state => ({
      pickups: [
        {
          ...pickup,
          id: `K-${Math.random().toString(36).substr(2, 9)}`,
          status: 'Requested',
        },
        ...state.pickups,
      ],
    }));
  },
  updatePickupStatus: (id, status) => {
    set(state => ({
      pickups: state.pickups.map(p => (p.id === id ? { ...p, status } : p)),
    }));
  },
  getPickupById: id => {
    return get().pickups.find(p => p.id === id);
  },
}));
