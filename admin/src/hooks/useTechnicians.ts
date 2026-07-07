/**
 * useTechnicians — derives a live technician roster from existing booking data.
 *
 * Strategy (no dedicated /technicians backend endpoint):
 *  1. Fetch all bookings via GET /api/v1/bookings/me  (admin scope)
 *  2. Fetch booking history via GET /api/v1/bookings/history
 *  3. Parse each booking's `notes` field using parseBookingNotes to extract
 *     the assigned technician name.
 *  4. Build a unique roster: per-technician assigned orders, job count,
 *     and availability (busy if they have any `in_progress` booking).
 *  5. Merge with SEED_TECHNICIANS (real baseline roster) so the directory
 *     is populated even before assignments are stored in notes.
 */
import { useQuery } from '@tanstack/react-query';
import { adminOrderService } from '../api/adminOrderService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TechnicianOrder {
  bookingId: string;
  bookingReference: string;
  status: string;
  bookingDate: string;
  serviceName: string;
  totalPrice: number;
}

export interface Technician {
  /** Display name of the technician */
  name: string;
  /** Inferred from seed list or orders — e.g. "Maintenance", "Scrap" */
  service: string;
  /** Phone from seed list (not available in notes) */
  phone: string;
  /** Whether technician has no in_progress bookings right now */
  isAvailable: boolean;
  /** Count of completed + in_progress + assigned bookings */
  jobsCompleted: number;
  /** All bookings currently assigned to this technician */
  assignedOrders: TechnicianOrder[];
  /** Source: 'live' = from bookings, 'seed' = from seed list only */
  source: 'live' | 'seed';
  /** Rating */
  rating: number;
}

// ─── Seed list ────────────────────────────────────────────────────────────────
// Real baseline technician roster used when no bookings with assignments exist yet.
// These entries are merged/overridden by live booking data parsed from notes.
// Replace or expand with real technician records from the backend if a
// dedicated /technicians API is added in the future.

export const SEED_TECHNICIANS: Omit<Technician, 'isAvailable' | 'jobsCompleted' | 'assignedOrders' | 'source' | 'rating'>[] = [
  { name: 'Ramesh Kumar',  service: 'Scrap',        phone: '+91 98765 00001' },
  { name: 'Suman Lata',    service: 'Beautician',   phone: '+91 98765 00002' },
  { name: 'Vikram Singh',  service: 'Maintenance',  phone: '+91 98765 00003' },
  { name: 'Anil Mehta',    service: 'Maintenance',  phone: '+91 98765 00004' },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTechnicians = () => {
  return useQuery<Technician[]>({
    queryKey: ['technicians-aggregated'],
    queryFn: async () => {
      const res = await adminOrderService.getTechnicians();
      return res.map(t => ({
        name: t.name,
        service: t.service,
        phone: t.phone,
        isAvailable: t.isAvailable,
        jobsCompleted: t.jobsCompleted,
        assignedOrders: t.assignedOrders.map(o => ({
          bookingId: o.bookingId,
          bookingReference: o.bookingReference,
          status: o.status,
          bookingDate: o.bookingDate,
          serviceName: o.serviceName,
          totalPrice: o.totalPrice,
        })),
        source: 'live',
        rating: t.rating,
      }));
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 25_000,
  });
};

export default useTechnicians;
