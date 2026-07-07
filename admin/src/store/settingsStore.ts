import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PermissionMatrixItem {
  id: string;
  section: string;
  name: string;
  admin: boolean;
  manager: boolean;
  dispatcher: boolean;
  viewer: boolean;
}

interface SettingsState {
  permissions: PermissionMatrixItem[];
  minScrapPickupValue: string;
  commissionRate: string;
  payoutCutoffHours: string;
  maxDispatchRadius: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  twilioSid: string;
  twilioToken: string;
  firebaseConfig: string;
  mfaEnabled: boolean;
  emailAlerts: boolean;
  maintenanceMode: boolean;
  setPermissions: (permissions: PermissionMatrixItem[]) => void;
  togglePermission: (
    id: string,
    role: 'admin' | 'manager' | 'dispatcher' | 'viewer',
  ) => void;
  updateBusinessRules: (rules: {
    minScrapPickupValue: string;
    commissionRate: string;
    payoutCutoffHours: string;
    maxDispatchRadius: string;
  }) => void;
  updateApiCredentials: (creds: {
    razorpayKeyId: string;
    razorpayKeySecret: string;
    twilioSid: string;
    twilioToken: string;
    firebaseConfig: string;
  }) => void;
  updateSystemControls: (controls: {
    mfaEnabled: boolean;
    emailAlerts: boolean;
    maintenanceMode: boolean;
  }) => void;
  resetToDefault: () => void;
}

const defaultPermissions: PermissionMatrixItem[] = [
  {
    id: 'perm-1',
    section: 'Orders & Bookings',
    name: 'View Orders',
    admin: true,
    manager: true,
    dispatcher: true,
    viewer: true,
  },
  {
    id: 'perm-2',
    section: 'Orders & Bookings',
    name: 'Update Order Status',
    admin: true,
    manager: true,
    dispatcher: true,
    viewer: false,
  },
  {
    id: 'perm-3',
    section: 'Orders & Bookings',
    name: 'Assign Technician',
    admin: true,
    manager: true,
    dispatcher: true,
    viewer: false,
  },
  {
    id: 'perm-4',
    section: 'Technicians',
    name: 'Manage Technicians CRUD',
    admin: true,
    manager: true,
    dispatcher: false,
    viewer: false,
  },
  {
    id: 'perm-5',
    section: 'Service Catalog',
    name: 'Edit Pricing & Services',
    admin: true,
    manager: false,
    dispatcher: false,
    viewer: false,
  },
  {
    id: 'perm-6',
    section: 'Payments & Refunds',
    name: 'Process Refunds',
    admin: true,
    manager: true,
    dispatcher: false,
    viewer: false,
  },
];

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      permissions: defaultPermissions,
      minScrapPickupValue: '500',
      commissionRate: '15',
      payoutCutoffHours: '24',
      maxDispatchRadius: '10',
      razorpayKeyId: 'rzp_live_8Fh39v2Ksd8s2l',
      razorpayKeySecret: '••••••••••••••••••••••••••••••••',
      twilioSid: 'AC894bfa28e83b4b893cf82de29a',
      twilioToken: '••••••••••••••••••••••••••••••••',
      firebaseConfig: JSON.stringify(
        {
          apiKey: 'AIzaSyAs-9f8h23n...',
          authDomain: 'urban-power-prod.firebaseapp.com',
          projectId: 'urban-power-prod',
        },
        null,
        2,
      ),
      mfaEnabled: true,
      emailAlerts: true,
      maintenanceMode: false,

      setPermissions: permissions => set({ permissions }),
      togglePermission: (id, role) =>
        set(state => ({
          permissions: state.permissions.map(p =>
            p.id === id ? { ...p, [role]: !p[role] } : p,
          ),
        })),
      updateBusinessRules: rules => set({ ...rules }),
      updateApiCredentials: creds => set({ ...creds }),
      updateSystemControls: controls => set({ ...controls }),
      resetToDefault: () =>
        set({
          permissions: defaultPermissions,
          minScrapPickupValue: '500',
          commissionRate: '15',
          payoutCutoffHours: '24',
          maxDispatchRadius: '10',
          razorpayKeyId: 'rzp_live_8Fh39v2Ksd8s2l',
          razorpayKeySecret: '••••••••••••••••••••••••••••••••',
          twilioSid: 'AC894bfa28e83b4b893cf82de29a',
          twilioToken: '••••••••••••••••••••••••••••••••',
          firebaseConfig: JSON.stringify(
            {
              apiKey: 'AIzaSyAs-9f8h23n...',
              authDomain: 'urban-power-prod.firebaseapp.com',
              projectId: 'urban-power-prod',
            },
            null,
            2,
          ),
          mfaEnabled: true,
          emailAlerts: true,
          maintenanceMode: false,
        }),
    }),
    {
      name: 'urban-power-admin-settings',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
