import { create } from 'zustand';

export type BookingType = 'Service' | 'Kabadi' | 'Product';

export interface Booking {
  id: string;
  type: BookingType;
  title: string;
  subtitle?: string;
  date: string;
  time?: string;
  status: 'Pending' | 'Confirmed' | 'In-Progress' | 'Completed' | 'Cancelled';
  price: number;
  address: string;
  customerName: string;
  partner?: {
    name: string;
    phone: string;
    rating: number;
  };
}

interface BookingState {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  cancelBooking: (id: string) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  addBooking: (booking) => {
    set((state) => ({
      bookings: [
        { 
          ...booking, 
          id: `UP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 
          status: 'Confirmed' 
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
  cancelBooking: (id) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status: 'Cancelled' as const } : b
      ),
    }));
  },
}));
