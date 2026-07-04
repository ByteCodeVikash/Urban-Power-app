import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  type:
    | 'New Order'
    | 'Order Assigned'
    | 'Payment Success'
    | 'Payment Failed'
    | 'Refund Requested'
    | 'Refund Approved'
    | 'New User'
    | 'Technician Joined'
    | 'System Notification';
  message: string;
  timestamp: string;
  isRead: boolean;
  meta?: Record<string, any>;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (
    notification: Omit<NotificationItem, 'id' | 'isRead' | 'timestamp'>,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    {
      id: 'n1',
      type: 'New Order',
      message: 'New Scrap Order request ORD-001 by Vikash Kumar.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
      isRead: false,
    },
    {
      id: 'n2',
      type: 'Technician Joined',
      message: 'Technician Rajesh Patil has completed verification.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      isRead: false,
    },
    {
      id: 'n3',
      type: 'Payment Success',
      message: 'Payment of ₹1,800 received for ORD-103.',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      isRead: true,
    },
  ],
  unreadCount: 2,

  addNotification: item => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    set(state => {
      const newList = [newNotif, ...state.notifications];
      return {
        notifications: newList,
        unreadCount: newList.filter(n => !n.isRead).length,
      };
    });
  },

  markAsRead: id => {
    set(state => {
      const newList = state.notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n,
      );
      return {
        notifications: newList,
        unreadCount: newList.filter(n => !n.isRead).length,
      };
    });
  },

  markAllAsRead: () => {
    set(state => {
      const newList = state.notifications.map(n => ({ ...n, isRead: true }));
      return {
        notifications: newList,
        unreadCount: 0,
      };
    });
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
}));
