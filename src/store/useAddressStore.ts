import { create } from 'zustand';
import { api } from '../services/api';

export interface Address {
  id: string;
  user_id: string;
  address_type: string;
  house_number?: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface AddressState {
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
  fetchAddresses: () => Promise<void>;
  addAddress: (data: any) => Promise<Address>;
  updateAddress: (id: string, data: any) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  isLoading: false,
  error: null,
  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.address.getAddresses();
      set({ addresses: data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to fetch addresses',
        isLoading: false,
      });
    }
  },
  addAddress: async data => {
    set({ isLoading: true, error: null });
    try {
      const newAddress = await api.address.addAddress(data);
      await get().fetchAddresses();
      set({ isLoading: false });
      return newAddress;
    } catch (err: any) {
      set({ error: err.message || 'Failed to add address', isLoading: false });
      throw err;
    }
  },
  updateAddress: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await api.address.updateAddress(id, data);
      await get().fetchAddresses();
      set({ isLoading: false });
      return updated;
    } catch (err: any) {
      set({
        error: err.message || 'Failed to update address',
        isLoading: false,
      });
      throw err;
    }
  },
  deleteAddress: async id => {
    set({ isLoading: true, error: null });
    try {
      await api.address.deleteAddress(id);
      await get().fetchAddresses();
      set({ isLoading: false });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to delete address',
        isLoading: false,
      });
      throw err;
    }
  },
  setDefaultAddress: async id => {
    set({ isLoading: true, error: null });
    try {
      await api.address.setDefaultAddress(id);
      await get().fetchAddresses();
      set({ isLoading: false });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to set default address',
        isLoading: false,
      });
      throw err;
    }
  },
}));
