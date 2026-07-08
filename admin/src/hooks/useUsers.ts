import { useQuery } from '@tanstack/react-query';
import { adminOrderService } from '../api/adminOrderService';

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
  return useQuery<UserProfile[]>({
    queryKey: ['users-derived-aggregated'],
    queryFn: async () => {
      const result = await adminOrderService.getOrders({
        page: 1,
        page_size: 10000,
      });

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

      result.items.forEach((item) => {
        const uid = item.user_id;
        if (!uid) return;

        const bookingDate = item.booking_date || item.created_at;
        const userBooking: UserBooking = {
          id: item.booking_id,
          booking_reference: item.booking_reference,
          service_name: item.service_name || 'Service Booking',
          booking_date: bookingDate,
          timeslot_str: item.preferred_time || '',
          status: item.status,
          total_price: item.price || 0,
          payment_method: item.payment_method || null,
          notes: null,
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

        if (item.customer_name) {
          entry.names.push(item.customer_name);
        }
        if (item.customer_phone) {
          entry.phones.push(item.customer_phone);
        }
        if (bookingDate) {
          entry.dates.push(bookingDate);
        }
        entry.totalSpend += item.price || 0;
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
  return useQuery<number>({
    queryKey: ['users-count-db'],
    queryFn: async () => {
      return await adminOrderService.getUsersCount();
    },
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
};
