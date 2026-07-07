import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { aggregateAllBookings } from '../api/bookingAggregator';
import { parseBookingNotes } from './useBookings';

export interface UserProfile {
  id: string;            // user_id UUID from bookings
  name: string;          // extracted from booking notes
  phone: string;         // extracted from booking notes
  email: string;         // derived: user_{id_prefix}@urbanpower.com
  role: string;          // always 'client' for app users
  is_active: boolean;
  is_verified: boolean;
  joined: string;        // earliest booking date = approximate join date
  bookingsCount: number;
  lastActivity: string;  // most recent booking date
  totalSpend: number;    // sum of total_price across all bookings
  bookings: UserBooking[];
}

export interface UserBooking {
  id: string;
  booking_reference: string;
  service_name: string;
  booking_date: string;
  timeslot_str: string;
  status: string;
  total_price: number;
  payment_method: string | null;
  notes: string | null;
}

export const useUsers = () => {
  const token = useAuthStore.getState().token;

  return useQuery<UserProfile[]>({
    queryKey: ['users-derived-aggregated'],
    queryFn: async () => {
      // Aggregate bookings from ALL users platform-wide
      const { bookings: bookingsData, historyMap } = await aggregateAllBookings(token || '');

      // Group bookings by user_id
      const userMap = new Map<string, {
        user_id: string;
        names: string[];
        phones: string[];
        dates: string[];
        totalSpend: number;
        bookings: UserBooking[];
        is_active: boolean;
        is_verified: boolean;
      }>();

      bookingsData.forEach((booking: any) => {
        const uid = booking.user_id?.toString();
        if (!uid) return;

        const parsed = parseBookingNotes(booking.notes);
        const bookingIdStr = (booking.id || booking.booking_id)?.toString();
        const historyItem = bookingIdStr ? historyMap.get(bookingIdStr) : null;

        const userBooking: UserBooking = {
          id: booking.id || booking.booking_id || '',
          booking_reference: booking.booking_reference || '',
          service_name: historyItem?.service || 'Service Booking',
          booking_date: booking.booking_date || '',
          timeslot_str: historyItem?.timeslot || '',
          status: booking.status || '',
          total_price: Number(booking.total_price) || 0,
          payment_method: booking.payment_method || null,
          notes: booking.notes || null,
        };

        if (!userMap.has(uid)) {
          userMap.set(uid, {
            user_id: uid,
            names: [],
            phones: [],
            dates: [],
            totalSpend: 0,
            bookings: [],
            is_active: true,
            is_verified: true,
          });
        }

        const entry = userMap.get(uid)!;

        if (parsed.customerName && parsed.customerName !== 'Client') {
          entry.names.push(parsed.customerName);
        }
        if (parsed.phone) {
          entry.phones.push(parsed.phone);
        }
        if (booking.booking_date) {
          entry.dates.push(booking.booking_date);
        }
        entry.totalSpend += Number(booking.total_price) || 0;
        entry.bookings.push(userBooking);
      });

      // Convert map to UserProfile array
      const users: UserProfile[] = [];

      userMap.forEach((entry, uid) => {
        // Pick most common name (or first non-empty)
        const nameFreq = new Map<string, number>();
        entry.names.forEach(n => nameFreq.set(n, (nameFreq.get(n) || 0) + 1));
        let name = 'Customer';
        let maxFreq = 0;
        nameFreq.forEach((freq, n) => {
          if (freq > maxFreq) { maxFreq = freq; name = n; }
        });

        // Pick last known phone
        const phone = entry.phones[entry.phones.length - 1] || '';

        // Sort dates
        const sortedDates = [...entry.dates].sort();
        const joinedDate = sortedDates[0]?.split('T')[0] || '';
        const lastActivity = sortedDates[sortedDates.length - 1]?.split('T')[0] || '';

        // Sort bookings newest-first
        const sortedBookings = [...entry.bookings].sort((a, b) =>
          b.booking_date.localeCompare(a.booking_date)
        );

        const idPrefix = uid.replace(/-/g, '').substring(0, 8);

        users.push({
          id: uid,
          name,
          phone,
          email: `user_${idPrefix}@urbanpower.com`,
          role: 'client',
          is_active: entry.is_active,
          is_verified: entry.is_verified,
          joined: joinedDate,
          bookingsCount: entry.bookings.length,
          lastActivity,
          totalSpend: Math.round(entry.totalSpend * 100) / 100,
          bookings: sortedBookings,
        });
      });

      // Sort users by most recent activity
      users.sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));

      return users;
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 25_000,
  });
};

export const useUserCount = () => {
  const token = useAuthStore.getState().token;

  return useQuery<number>({
    queryKey: ['users-count-aggregated'],
    queryFn: async () => {
      const { bookings } = await aggregateAllBookings(token || '');
      const unique = new Set(bookings.map((b: any) => b.user_id?.toString()).filter(Boolean));
      return unique.size;
    },
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
};
