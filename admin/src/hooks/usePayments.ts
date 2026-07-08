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
import { adminOrderService } from '../api/adminOrderService';

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
  const query = useQuery<PaymentTransaction[]>({
    queryKey: ['payments-derived-aggregated'],
    queryFn: async () => {
      const result = await adminOrderService.getOrders({
        page: 1,
        page_size: 10000,
      });

      const transactions: PaymentTransaction[] = result.items.map(item => {
        const ref = item.booking_reference || item.booking_id.slice(0, 8).toUpperCase();
        const gateway = deriveGateway(item.payment_method);
        const status = deriveStatus(item.status, gateway);
        const amount = item.price || 0;
        const bdate = item.booking_date || item.created_at;

        return {
          id: `TXN-${ref.slice(0, 8)}`,
          bookingId: item.booking_id,
          bookingReference: ref,
          serviceName: item.service_name || 'Service Booking',
          timeslot: item.preferred_time || '',
          customerName: item.customer_name || 'Customer',
          customerPhone: item.customer_phone || '',
          gateway,
          amount,
          amountLabel: formatINR(amount),
          status,
          bookingStatus: item.status,
          bookingDate: bdate,
          dateLabel: formatDateLabel(bdate),
          notes: null,
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
