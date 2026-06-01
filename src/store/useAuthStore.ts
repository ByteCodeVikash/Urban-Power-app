import { create } from 'zustand';

export type UserRole = 'Customer' | 'Technician' | 'Admin';

interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (phone: string, role: UserRole, name?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  role: null,
  login: (phone, role, name = 'User') => {
    set({
      user: { id: Math.random().toString(), phone, name, role },
      isAuthenticated: true,
      role: role,
    });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false, role: null });
  },
  switchRole: (role) => {
    set((state) => ({
      role: role,
      user: state.user ? { ...state.user, role } : null,
    }));
  },
}));
