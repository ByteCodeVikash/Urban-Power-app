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
import { useAuthStore } from '../store/authStore';
import { aggregateAllBookings } from '../api/bookingAggregator';
import { parseBookingNotes } from './useBookings';

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
}

// ─── Seed list ────────────────────────────────────────────────────────────────
// Real baseline technician roster used when no bookings with assignments exist yet.
// These entries are merged/overridden by live booking data parsed from notes.
// Replace or expand with real technician records from the backend if a
// dedicated /technicians API is added in the future.

export const SEED_TECHNICIANS: Omit<Technician, 'isAvailable' | 'jobsCompleted' | 'assignedOrders' | 'source'>[] = [
  { name: 'Ramesh Kumar',  service: 'Scrap',        phone: '+91 98765 00001' },
  { name: 'Suman Lata',    service: 'Beautician',   phone: '+91 98765 00002' },
  { name: 'Vikram Singh',  service: 'Maintenance',  phone: '+91 98765 00003' },
  { name: 'Anil Mehta',    service: 'Maintenance',  phone: '+91 98765 00004' },
];

// ─── Raw API shapes ───────────────────────────────────────────────────────────

interface RawBooking {
  id: string;
  booking_id: string;
  booking_reference: string;
  status: string;
  booking_date: string;
  total_price: number;
  notes?: string | null;
  service_id: string;
}

interface HistoryItem {
  booking_id: string;
  service: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTechnicians = () => {
  const token = useAuthStore.getState().token;

  return useQuery<Technician[]>({
    queryKey: ['technicians-aggregated'],
    queryFn: async () => {
      // 1. Fetch ALL bookings platform-wide via aggregator
      const { bookings, historyMap } = await aggregateAllBookings(token || '');

      // Build a quick lookup: bookingId → serviceName
      const serviceMap: Record<string, string> = {};
      historyMap.forEach((h, key) => {
        serviceMap[key] = h.service || 'Service Booking';
      });

      // 2. Parse bookings → aggregate per technician name
      const techMap: Record<string, {
        orders: TechnicianOrder[];
        hasInProgress: boolean;
      }> = {};

      for (const b of bookings) {
        const parsed = parseBookingNotes(b.notes);
        const techName = parsed.technician;

        // Skip unassigned bookings
        if (!techName || techName === 'None' || techName === '') continue;

        if (!techMap[techName]) {
          techMap[techName] = { orders: [], hasInProgress: false };
        }

        const bookingId = String(b.id || b.booking_id);
        const order: TechnicianOrder = {
          bookingId,
          bookingReference: b.booking_reference || bookingId.slice(0, 8).toUpperCase(),
          status: b.status,
          bookingDate: b.booking_date,
          serviceName: serviceMap[bookingId] || 'Service Booking',
          totalPrice: Number(b.total_price) || 0,
        };

        techMap[techName].orders.push(order);

        if (b.status === 'in_progress') {
          techMap[techName].hasInProgress = true;
        }
      }

      // 3. Build live technician entries
      const liveTechs: Technician[] = Object.entries(techMap).map(([name, data]) => {
        // Try to find seed info for this name
        const seed = SEED_TECHNICIANS.find(
          s => s.name.toLowerCase() === name.toLowerCase(),
        );
        const completedCount = data.orders.filter(
          o => o.status === 'completed',
        ).length;

        return {
          name,
          service: seed?.service ?? 'General',
          phone: seed?.phone ?? '—',
          isAvailable: !data.hasInProgress,
          jobsCompleted: completedCount,
          assignedOrders: data.orders,
          source: 'live',
        };
      });

      // 4. Merge seed technicians (add those not yet seen in live data)
      const liveNames = new Set(liveTechs.map(t => t.name.toLowerCase()));
      const seedOnly: Technician[] = SEED_TECHNICIANS.filter(
        s => !liveNames.has(s.name.toLowerCase()),
      ).map(s => ({
        ...s,
        isAvailable: true,
        jobsCompleted: 0,
        assignedOrders: [],
        source: 'seed',
      }));

      return [...liveTechs, ...seedOnly];
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 25_000,
  });
};

export default useTechnicians;
