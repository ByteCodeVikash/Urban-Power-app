import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  admin: User | null;
  token: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  permissions: string[] | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (user: User, token: string, refreshToken: string, permissions: string[]) => void;
  logout: () => void;
  setToken: (token: string | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setUser: (user: User | null) => void;
  setAdmin: (admin: User | null) => void;
  setPermissions: (permissions: string[] | null) => void;
  setInitializing: (isInitializing: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      admin: null,
      token: null,
      accessToken: null,
      refreshToken: null,
      permissions: null,
      isAuthenticated: false,
      isInitializing: true,
      login: (user, token, refreshToken, permissions) =>
        set({
          user,
          admin: user,
          token,
          accessToken: token,
          refreshToken,
          permissions,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          admin: null,
          token: null,
          accessToken: null,
          refreshToken: null,
          permissions: null,
          isAuthenticated: false,
        }),
      setToken: token => set({ token, accessToken: token }),
      setAccessToken: accessToken => set({ token: accessToken, accessToken }),
      setRefreshToken: refreshToken => set({ refreshToken }),
      setUser: user => set({ user, admin: user }),
      setAdmin: admin => set({ user: admin, admin }),
      setPermissions: permissions => set({ permissions }),
      setInitializing: isInitializing => set({ isInitializing }),
    }),
    {
      name: 'urban-power-admin-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        user: state.user,
        admin: state.admin,
        token: state.token,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);


