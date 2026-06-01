import { create } from 'zustand';

export interface ServiceBooking {
  id: string;
  categoryName: string;
  serviceTitle: string;
  serviceId: string;
  customerName: string;
  address: string;
  date: string;
  price: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

interface ServiceBookingState {
  bookings: ServiceBooking[];
  addBooking: (booking: Omit<ServiceBooking, 'id' | 'status'>) => void;
  updateBookingStatus: (id: string, status: ServiceBooking['status']) => void;
}

export const useServiceBookingStore = create<ServiceBookingState>((set) => ({
  bookings: [],
  addBooking: (booking) => {
    set((state) => ({
      bookings: [
        { 
          ...booking, 
          id: `B-${Math.random().toString(36).substr(2, 9)}`, 
          status: 'Pending' 
        },
        ...state.bookings,
      ],
    }));
  },
  updateBookingStatus: (id, status) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status } : b
      ),
    }));
  },
}));
