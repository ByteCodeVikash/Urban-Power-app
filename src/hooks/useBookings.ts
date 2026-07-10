import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

function parseTimeslotFromNotes(notes: string | null | undefined): string {
  if (!notes) return '';
  const match = notes.match(/Timeslot:\s*([^|,\n]+)/i);
  return match ? match[1].trim() : '';
}

export const useBookingHistory = () => {
  return useQuery({
    queryKey: ['booking-history'],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const [beautician, scrap, maintenance] = await Promise.all([
        api.bookings.getBookingHistory().catch((err: any) => {
          console.error('Error fetching beautician history:', err);
          return [];
        }),
        api.kabadi.getMyBookings().catch((err: any) => {
          console.error('Error fetching scrap history:', err);
          return [];
        }),
        api.maintenance.getMyBookings().catch((err: any) => {
          console.error('Error fetching maintenance history:', err);
          return [];
        }),
      ]);

      const normalizedBeautician = (beautician || []).map((item: any) => ({
        booking_id: item.booking_id,
        id: item.booking_id,
        service: item.service || 'Unknown Beauty Service',
        date: item.date,
        timeslot: item.timeslot,
        status: item.status,
        payment_method: item.payment_method || 'COD',
        type: 'beautician',
      }));

      const normalizedScrap = (scrap || []).map((item: any) => {
        const dateStr = item.booking_date
          ? item.booking_date.split('T')[0]
          : '';
        return {
          booking_id: item.id,
          id: item.id,
          service: `Scrap Pickup (${item.item_name || item.category_name || 'Mixed'})`,
          date: dateStr,
          timeslot: item.time_slot || '',
          status: item.status,
          estimatedValue: item.estimated_value,
          payment_method: 'Wallet',
          type: 'scrap',
          categories: [item.category_name].filter(Boolean),
        };
      });

      const normalizedMaintenance = (maintenance || []).map((item: any) => {
        const dateStr = item.booking_date
          ? item.booking_date.split('T')[0]
          : '';
        return {
          booking_id: item.id,
          id: item.id,
          service:
            item.service_names && item.service_names.length > 0
              ? item.service_names.join(', ')
              : 'Maintenance Service',
          date: dateStr,
          timeslot: parseTimeslotFromNotes(item.notes),
          status: item.status,
          price: item.total_price || 0,
          payment_method: 'COD',
          type: 'maintenance',
        };
      });

      const allBookings = [
        ...normalizedBeautician,
        ...normalizedScrap,
        ...normalizedMaintenance,
      ];

      allBookings.sort((a, b) => {
        const dateA = new Date(a.date).getTime() || 0;
        const dateB = new Date(b.date).getTime() || 0;
        return dateB - dateA;
      });

      return allBookings;
    },
  });
};

export const useBookingDetails = (
  bookingId: string,
  bookingType: 'beautician' | 'maintenance',
) => {
  return useQuery({
    queryKey: ['booking-details', bookingType, bookingId],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      if (bookingType === 'beautician') {
        return api.bookings.getBookingDetails(bookingId);
      } else {
        return api.maintenance.getBookingDetails(bookingId);
      }
    },
    enabled: !!bookingId && !!bookingType,
  });
};

export const useScrapBookingDetails = (bookingId: string) => {
  return useQuery({
    queryKey: ['scrap-booking-details', bookingId],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryFn: () => api.kabadi.getBookingDetails(bookingId),
    enabled: !!bookingId,
  });
};
