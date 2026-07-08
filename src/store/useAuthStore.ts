import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'Customer' | 'Technician' | 'Admin';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  email?: string;
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  accessToken: string | null;
  login: (
    phone: string,
    role: UserRole,
    name?: string,
    id?: string,
    accessToken?: string,
  ) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (updatedFields: Partial<Omit<User, 'id' | 'role'>>) => void;
}

// Fail-safe storage wrapper to handle native module environment safety
const customStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (e: any) {
      console.warn('[useAuthStore] Error reading auth session:', e);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (e: any) {
      console.warn('[useAuthStore] Error writing auth session:', e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (e: any) {
      console.warn('[useAuthStore] Error removing auth session:', e);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,
      role: null,
      accessToken: null,
      login: (
        phone,
        role,
        name = 'User',
        id = Math.random().toString(),
        accessToken,
      ) => {
        set({
          user: {
            id,
            phone,
            name,
            role,
          },
          isAuthenticated: true,
          role: role,
          accessToken: accessToken || null,
        });
      },
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          role: null,
          accessToken: null,
        });
      },
      switchRole: role => {
        set(state => ({
          role: role,
          user: state.user ? { ...state.user, role } : null,
        }));
      },
      updateProfile: updatedFields => {
        set(state => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        }));
      },
    }),
    {
      name: 'urban-power-auth-session',
      storage: createJSONStorage(() => customStorage),
    },
  ),
);
