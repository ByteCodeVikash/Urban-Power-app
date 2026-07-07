/**
 * usePayments — derives payment transaction data from existing booking APIs.
 *
 * Strategy (no dedicated GET /payments list endpoint in backend):
 *  1. Fetch bookings via GET /api/v1/bookings/me  (admin scope — all bookings)
 *  2. Fetch booking history via GET /api/v1/bookings/history (enriches with service name)
 *  3. Normalise each booking into a PaymentTransaction using:
 *       - booking.payment_method  → gateway (razorpay / cod / unknown)
 *       - booking.status          → derived settlement status
 *       - booking.total_price     → amount
 *       - booking.notes           → customer name/phone (via parseBookingNotes)
 *  4. Compute summary totals for the stat cards.
 *
 * Settlement status derivation:
 *   confirmed | completed  + razorpay → "Settled"
 *   pending   | in_progress + razorpay → "Escrow"
 *   confirmed | completed  + cod      → "Settled"
 *   pending   | in_progress + cod     → "Pending Cash"
 *   cancelled (any method)            → "Refunded"
 */
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { aggregateAllBookings } from '../api/bookingAggregator';
import { parseBookingNotes } from './useBookings';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentGateway = 'Razorpay' | 'COD' | 'Unknown';
export type SettlementStatus = 'Settled' | 'Escrow' | 'Pending Cash' | 'Refunded';

export interface PaymentTransaction {
  /** Formatted display ID, e.g. "TXN-A1B2C3D4" */
  id: string;
  /** Raw booking UUID */
  bookingId: string;
  /** Human-readable booking reference */
  bookingReference: string;
  /** Service name from history */
  serviceName: string;
  /** Timeslot string from history */
  timeslot: string;
  /** Customer display name (parsed from booking notes) */
  customerName: string;
  /** Customer phone (parsed from booking notes) */
  customerPhone: string;
  /** Payment gateway */
  gateway: PaymentGateway;
  /** Amount in INR (raw number) */
  amount: number;
  /** Formatted amount string e.g. "₹1,200" */
  amountLabel: string;
  /** Derived settlement status */
  status: SettlementStatus;
  /** Raw booking status for reference */
  bookingStatus: string;
  /** Booking date (ISO string) */
  bookingDate: string;
  /** Display date e.g. "2026-07-05" */
  dateLabel: string;
  /** Notes field for additional details */
  notes: string | null;
}

export interface PaymentSummary {
  totalRevenue: number;
  razorpayTotal: number;
  codTotal: number;
  refundedTotal: number;
  transactionCount: number;
  razorpayCount: number;
  codCount: number;
}

// ─── Raw API shapes ───────────────────────────────────────────────────────────

interface RawBooking {
  id?: string;
  booking_id?: string;
  booking_reference?: string;
  status: string;
  payment_method?: string | null;
  total_price: number;
  booking_date: string;
  notes?: string | null;
}

interface HistoryItem {
  booking_id: string;
  service?: string;
  timeslot?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  return `₹${new Intl.NumberFormat('en-IN').format(Math.round(amount))}`;
}

function deriveGateway(raw: string | null | undefined): PaymentGateway {
  if (!raw) return 'Unknown';
  const lower = raw.toLowerCase();
  if (lower === 'razorpay' || lower === 'card' || lower === 'upi') return 'Razorpay';
  if (lower === 'cod' || lower === 'cash') return 'COD';
  return 'Unknown';
}

function deriveStatus(
  bookingStatus: string,
  gateway: PaymentGateway,
): SettlementStatus {
  const s = bookingStatus.toLowerCase();
  if (s === 'cancelled') return 'Refunded';
  if (s === 'completed' || s === 'confirmed') {
    return 'Settled';
  }
  // pending, in_progress, scheduled, etc.
  if (gateway === 'Razorpay') return 'Escrow';
  return 'Pending Cash';
}

function formatDateLabel(iso: string): string {
  try {
    return iso.split('T')[0];
  } catch {
    return iso;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UsePaymentsResult {
  transactions: PaymentTransaction[];
  summary: PaymentSummary;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const usePayments = (): UsePaymentsResult => {
  const token = useAuthStore.getState().token;

  const query = useQuery<PaymentTransaction[]>({
    queryKey: ['payments-derived-aggregated'],
    queryFn: async () => {
      // Aggregate bookings from ALL users platform-wide
      const { bookings, historyMap: aggHistoryMap } = await aggregateAllBookings(token || '');

      // Alias types for this hook
      const bookingsData: RawBooking[] = bookings as RawBooking[];

      // Build lookup: bookingId → history item (already a Map from aggregator)
      const historyMap = aggHistoryMap as Map<string, HistoryItem>;

      const transactions: PaymentTransaction[] = bookingsData.map(booking => {
        const bookingId = String(booking.id || booking.booking_id || '');
        const ref = booking.booking_reference || bookingId.slice(0, 8).toUpperCase();
        const historyItem = historyMap.get(bookingId);

        const parsed = parseBookingNotes(booking.notes);
        const gateway = deriveGateway(booking.payment_method);
        const status = deriveStatus(booking.status, gateway);
        const amount = Number(booking.total_price) || 0;

        return {
          id: `TXN-${ref.slice(0, 8)}`,
          bookingId,
          bookingReference: ref,
          serviceName: historyItem?.service || 'Service Booking',
          timeslot: historyItem?.timeslot || '',
          customerName: parsed.customerName || 'Customer',
          customerPhone: parsed.phone || '',
          gateway,
          amount,
          amountLabel: formatINR(amount),
          status,
          bookingStatus: booking.status,
          bookingDate: booking.booking_date,
          dateLabel: formatDateLabel(booking.booking_date),
          notes: booking.notes ?? null,
        };
      });

      // Sort newest-first
      return transactions.sort((a, b) =>
        b.bookingDate.localeCompare(a.bookingDate),
      );
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 25_000,
  });

  const transactions = query.data ?? [];

  // Compute summary
  const summary: PaymentSummary = {
    totalRevenue: 0,
    razorpayTotal: 0,
    codTotal: 0,
    refundedTotal: 0,
    transactionCount: transactions.length,
    razorpayCount: 0,
    codCount: 0,
  };

  transactions.forEach(t => {
    if (t.status === 'Refunded') {
      summary.refundedTotal += t.amount;
    } else {
      summary.totalRevenue += t.amount;
    }
    if (t.gateway === 'Razorpay') {
      summary.razorpayTotal += t.amount;
      summary.razorpayCount += 1;
    } else if (t.gateway === 'COD') {
      summary.codTotal += t.amount;
      summary.codCount += 1;
    }
  });

  return {
    transactions,
    summary,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
};

export default usePayments;
