/**
 * useBookings.ts
 *
 * Thin wrapper that delegates to useAdminOrders.
 * The bookingAggregator (mock-OTP impersonation) is NO LONGER used.
 * All booking data now comes from /api/v1/admin/orders via the admin JWT.
 *
 * parseBookingNotes / buildBookingNotes helpers are kept because legacy
 * components (Technicians.tsx) still reference them.
 */

import { useQuery } from '@tanstack/react-query';
import { adminOrderService } from '../api/adminOrderService';
import type { AdminOrderItem } from '../api/adminOrderService';

// Re-export AdminOrderItem as Booking so existing imports don't break
export type Booking = AdminOrderItem & {
  // Legacy fields aliased for backward compat
  id: string;
  booking_id: string;
  booking_status: string;
  user_id: string;
  service_id: string;
  address_id?: string | null;
  booking_date: string;
  timeslot_id?: string | null;
  total_price: number;
  notes?: string | null;
  updated_at: string;
  service_type: 'Scrap' | 'Beautician' | 'Maintenance';
  payment_status: string;
  timeslot_str: string;
  customer_name: string;
  customer_phone: string;
  technician: string;
  custom_notes: string;
};

export interface ParsedBookingNotes {
  customerName: string;
  phone: string;
  technician: string;
  customNotes: string;
}

export function parseBookingNotes(
  notes: string | null | undefined,
): ParsedBookingNotes {
  if (!notes) {
    return {
      customerName: 'Client',
      phone: '',
      technician: 'None',
      customNotes: '',
    };
  }
  const nameMatch = notes.match(/Customer Name:\s*([^,\n]+)/i);
  const phoneMatch = notes.match(/Phone:\s*([^,\n]+)/i);
  const techMatch = notes.match(/Technician:\s*([^,\n]+)/i);
  let customerName = nameMatch ? nameMatch[1].trim() : 'Client';
  let phone = phoneMatch ? phoneMatch[1].trim() : '';
  let technician = techMatch ? techMatch[1].trim() : 'None';
  let customNotes = notes;
  if (nameMatch) customNotes = customNotes.replace(nameMatch[0], '');
  if (phoneMatch) customNotes = customNotes.replace(phoneMatch[0], '');
  if (techMatch) customNotes = customNotes.replace(techMatch[0], '');
  customNotes = customNotes
    .replace(/Customer Name:\s*,?/gi, '')
    .replace(/Phone:\s*,?/gi, '')
    .replace(/Technician:\s*,?/gi, '')
    .replace(/,\s*,/g, ',')
    .replace(/^[\s,]+|[\s,]+$/g, '')
    .trim();
  return { customerName, phone, technician, customNotes };
}

export function buildBookingNotes(
  customerName: string,
  phone: string,
  technician: string,
  customNotes?: string,
): string {
  const parts: string[] = [];
  if (customerName) parts.push(`Customer Name: ${customerName}`);
  if (phone) parts.push(`Phone: ${phone}`);
  if (technician && technician !== 'None')
    parts.push(`Technician: ${technician}`);
  if (customNotes) parts.push(customNotes);
  return parts.join(', ');
}

// ─── Map AdminOrderItem → Booking (legacy shape) ──────────────────────────────

function toBooking(item: AdminOrderItem): Booking {
  const serviceTypeMap: Record<string, 'Scrap' | 'Beautician' | 'Maintenance'> =
    {
      scrap: 'Scrap',
      beautician: 'Beautician',
      maintenance: 'Maintenance',
    };
  return {
    ...item,
    // Legacy aliases
    id: item.booking_id,
    booking_id: item.booking_id,
    booking_status: item.status,
    user_id: '',
    service_id: '',
    booking_date: item.booking_date || item.created_at,
    total_price: item.price || 0,
    notes: null,
    updated_at: item.created_at,
    service_type: serviceTypeMap[item.booking_type] || 'Beautician',
    payment_status: item.payment_status || 'Pending',
    timeslot_str: item.preferred_time || '',
    customer_name: item.customer_name || 'Unknown',
    customer_phone: item.customer_phone || '',
    technician: item.assigned_technician || 'None',
    custom_notes: '',
  } as Booking;
}

/**
 * useBookings — now delegates to /api/v1/admin/orders (real backend).
 * No more mock-OTP aggregation.
 */
export const useBookings = (filters: Record<string, any> = {}) => {
  return useQuery<Booking[]>({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      const result = await adminOrderService.getOrders({
        page: 1,
        page_size: 100,
        ...filters,
      });
      return result.items.map(toBooking);
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 25_000,
    retry: 2,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10_000),
  });
};
