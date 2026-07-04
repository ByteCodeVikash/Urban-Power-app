import { create } from 'zustand';

export interface AuditLogItem {
  id: string;
  user: string;
  time: string;
  action:
    | 'Login'
    | 'Logout'
    | 'Order Updated'
    | 'Payment Updated'
    | 'Service Updated'
    | 'Category Updated'
    | 'User Updated'
    | 'Technician Assigned'
    | 'Refund Processed';
  module: string;
  ip: string;
}

interface AuditState {
  logs: AuditLogItem[];
  addLog: (log: Omit<AuditLogItem, 'id' | 'time'>) => void;
  clearLogs: () => void;
}

export const useAuditStore = create<AuditState>(set => ({
  logs: [
    {
      id: 'log1',
      user: 'Super Admin (admin@urbanpower.in)',
      time: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 mins ago
      action: 'Login',
      module: 'Auth',
      ip: '195.35.22.164',
    },
    {
      id: 'log2',
      user: 'Super Admin (admin@urbanpower.in)',
      time: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
      action: 'Order Updated',
      module: 'Orders',
      ip: '195.35.22.164',
    },
    {
      id: 'log3',
      user: 'Finance Manager (finance@urbanpower.in)',
      time: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      action: 'Refund Processed',
      module: 'Payments',
      ip: '192.168.1.15',
    },
    {
      id: 'log4',
      user: 'Operations Manager (ops@urbanpower.in)',
      time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      action: 'Technician Assigned',
      module: 'Technicians',
      ip: '192.168.1.45',
    },
  ],

  addLog: log => {
    const newLog: AuditLogItem = {
      ...log,
      id: `log_${Math.random().toString(36).substr(2, 9)}`,
      time: new Date().toISOString(),
    };
    set(state => ({
      logs: [newLog, ...state.logs],
    }));
  },

  clearLogs: () => set({ logs: [] }),
}));
