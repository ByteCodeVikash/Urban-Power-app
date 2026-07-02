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
  phone?: string;
  partner?: {
    name: string;
    phone: string;
    rating: number;
  };
  image?: string;
  serviceId?: string;
  timeslotId?: string;
  rawDate?: string;
  images?: string[];
  paymentMethod?: string;
}

interface BookingState {
  bookings: Booking[];
  selectedDate: string;
  selectedTimeslot: {
    id: string;
    start_time: string;
    end_time: string;
    available: boolean;
  } | null;
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (method: string) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  cancelBooking: (id: string) => void;
  setSelectedDate: (date: string) => void;
  setSelectedTimeslot: (timeslot: any | null) => void;
  clearSelectedSlot: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  selectedDate: '',
  selectedTimeslot: null,
  selectedPaymentMethod: 'COD',
  setSelectedPaymentMethod: method => {
    set({ selectedPaymentMethod: method });
  },
  addBooking: booking => {
    const defaultPaymentMethod = get().selectedPaymentMethod;
    set(state => ({
      bookings: [
        {
          ...booking,
          id: `UP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          status: 'Confirmed',
          paymentMethod: booking.paymentMethod || defaultPaymentMethod,
        },
        ...state.bookings,
      ],
    }));
  },
  updateBookingStatus: (id, status) => {
    set(state => ({
      bookings: state.bookings.map(b => (b.id === id ? { ...b, status } : b)),
    }));
  },
  cancelBooking: id => {
    set(state => ({
      bookings: state.bookings.map(b =>
        b.id === id ? { ...b, status: 'Cancelled' as const } : b,
      ),
    }));
  },
  setSelectedDate: date => {
    set({ selectedDate: date, selectedTimeslot: null });
  },
  setSelectedTimeslot: timeslot => {
    set({ selectedTimeslot: timeslot });
  },
  clearSelectedSlot: () => {
    set({
      selectedDate: '',
      selectedTimeslot: null,
      selectedPaymentMethod: 'COD',
    });
  },
}));
