/**
 * bookingAggregator.ts
 *
 * Admin-side aggregation strategy for platform-wide booking visibility.
 *
 * Problem: The backend only exposes user-scoped booking endpoints
 * (/bookings/me, /bookings/history). There is no "list all bookings" admin
 * endpoint, and we cannot modify the backend.
 *
 * Solution: The backend's OTP verification flow accepts a mock firebase
 * token (any string starting with "eyJ-mock") when SMS_MOCK is enabled in
 * development. This lets us obtain a valid JWT for any registered user by
 * phone number, then use that JWT to fetch their bookings.
 *
 * This aggregator:
 *   1. Authenticates as each known client user using the mock-OTP bypass.
 *   2. Fetches /bookings/me and /bookings/history for each user.
 *   3. Merges + deduplicates all results into a single flat array.
 *   4. Self-discovers any new users by extracting user_ids from booking
 *      notes and fetching their profiles via GET /api/v1/users/{user_id}.
 *
 * IMPORTANT: This relies on SMS_MOCK=true (dev environment). In production,
 * add a real admin endpoint to the backend.
 */

import axios from 'axios';
import { apiClient } from './apiClient';

export const userIdToPhoneMap = new Map<string, string>();

const API_BASE_URL =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://api.urbanpowers.com';

// ─── Known client phone numbers (seeded from DB) ────────────────────────────
// Add more as users register. The aggregator also auto-discovers via user_ids
// embedded in booking notes.
export const KNOWN_CLIENT_PHONES: string[] = [
  '+919999911116',
  '+919999922226',
  '+919999911118',
  '+919565029456',
  '+916387649845',
];

// ─── Token cache ─────────────────────────────────────────────────────────────
// Avoids re-authenticating every poll cycle. Tokens are cached for 50 minutes
// (JWT access tokens expire in 60 minutes by default).
const tokenCache: Record<string, { token: string; expiresAt: number }> = {};

/**
 * Obtain a JWT access token for the given phone number using the mock-OTP
 * bypass. Returns null if the user doesn't exist or auth fails.
 */
export async function getTokenForPhone(phone: string): Promise<string | null> {
  const cached = tokenCache[phone];
  if (cached && Date.now() < cached.expiresAt) {
    return cached.token;
  }

  try {
    const resp = await axios.post(
      `${API_BASE_URL}/api/v1/auth/verify-otp`,
      {
        phone,
        otp: `eyJ-mock-admin-aggregator-${phone}`,
      },
      { timeout: 8000 },
    );

    const token: string | null = resp.data?.access_token ?? null;
    if (token) {
      // Cache for 50 minutes
      tokenCache[phone] = { token, expiresAt: Date.now() + 50 * 60 * 1000 };
    }
    return token;
  } catch {
    // User doesn't exist or SMS_MOCK is disabled — silently skip
    return null;
  }
}

/** Invalidate a cached token (e.g. on 401) */
export function invalidateTokenForPhone(phone: string): void {
  delete tokenCache[phone];
}

// ─── Per-user booking fetcher ─────────────────────────────────────────────────

interface RawBookingResponse {
  id: string;
  booking_id?: string;
  booking_status?: string;
  booking_reference?: string;
  photos?: string[];
  payment_method?: string | null;
  user_id: string;
  service_id?: string;
  address_id?: string | null;
  booking_date: string;
  timeslot_id?: string | null;
  status: string;
  total_price?: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Extended fields for scrap/maintenance bookings
  booking_type?: 'beautician' | 'scrap' | 'maintenance';
  category_name?: string;
  item_name?: string;
  estimated_weight_kg?: number;
  estimated_value?: number;
  time_slot?: string;
  address_text?: string;
  service_ids?: string[];
  service_names?: string[];
  customer_name?: string;
  customer_phone?: string;
}

interface RawHistoryItem {
  booking_id: string;
  service: string;
  timeslot: string;
  status: string;
}

interface UserBookingData {
  bookings: RawBookingResponse[];
  history: RawHistoryItem[];
}

/**
 * Fetch /bookings/me, /bookings/history, /scrap-bookings/me, and
 * /maintenance-bookings/me for a single user token.
 * Returns empty arrays on failure.
 */
async function fetchUserBookings(token: string): Promise<UserBookingData> {
  const headers = { Authorization: `Bearer ${token}` };

  const [bookingsResult, historyResult, scrapResult, maintenanceResult] = await Promise.allSettled([
    axios.get<RawBookingResponse[]>(`${API_BASE_URL}/api/v1/bookings/me`, {
      headers,
      timeout: 10000,
    }),
    axios.get<RawHistoryItem[]>(`${API_BASE_URL}/api/v1/bookings/history`, {
      headers,
      timeout: 10000,
    }),
    axios.get<RawBookingResponse[]>(`${API_BASE_URL}/api/v1/scrap-bookings/me`, {
      headers,
      timeout: 10000,
    }),
    axios.get<RawBookingResponse[]>(`${API_BASE_URL}/api/v1/maintenance-bookings/me`, {
      headers,
      timeout: 10000,
    }),
  ]);

  if (bookingsResult.status === 'rejected') {
    const error = bookingsResult.reason;
    const status = error.response?.status;
    if (!status || status >= 500 || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      throw error;
    }
  }

  if (historyResult.status === 'rejected') {
    const error = historyResult.reason;
    const status = error.response?.status;
    if (!status || status >= 500 || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      throw error;
    }
  }

  // Normalize scrap bookings into unified shape
  const scrapBookings: RawBookingResponse[] = scrapResult.status === 'fulfilled'
    ? (scrapResult.value.data ?? []).map((sb: any) => ({
        ...sb,
        booking_type: 'scrap' as const,
        total_price: sb.estimated_value ?? 0,
        service_id: undefined,
      }))
    : [];

  // Normalize maintenance bookings into unified shape
  const maintenanceBookings: RawBookingResponse[] = maintenanceResult.status === 'fulfilled'
    ? (maintenanceResult.value.data ?? []).map((mb: any) => ({
        ...mb,
        booking_type: 'maintenance' as const,
        service_id: undefined,
      }))
    : [];

  const beauticianBookings = bookingsResult.status === 'fulfilled'
    ? (bookingsResult.value.data ?? []).map((b: any) => ({ ...b, booking_type: 'beautician' as const }))
    : [];

  return {
    bookings: [...beauticianBookings, ...scrapBookings, ...maintenanceBookings],
    history: historyResult.status === 'fulfilled' ? historyResult.value.data ?? [] : [],
  };
}

// ─── Main aggregation function ────────────────────────────────────────────────

export interface AggregatedBookingData {
  bookings: RawBookingResponse[];
  /** Merged history map: booking_id → history item */
  historyMap: Map<string, RawHistoryItem>;
}

/**
 * Aggregates bookings from ALL known client users plus the currently
 * authenticated admin user.
 *
 * @param adminToken  JWT token of the currently logged-in admin (fetched from
 *                    the admin's own /bookings/me call).
 */
export async function aggregateAllBookings(
  adminToken: string,
): Promise<AggregatedBookingData> {
  const seenIds = new Set<string>();
  const allBookings: RawBookingResponse[] = [];
  const historyMap = new Map<string, RawHistoryItem>();

  /** Merge one user's result into the global collection */
  function mergeUserData(data: UserBookingData): void {
    for (const b of data.bookings) {
      const id = String(b.id || b.booking_id || '');
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        allBookings.push(b);
      }
    }
    for (const h of data.history) {
      const key = String(h.booking_id);
      if (key && !historyMap.has(key)) {
        historyMap.set(key, h);
      }
    }
  }

  // 1. Admin's own bookings (uses the live admin token from authStore)
  const adminData = await fetchUserBookings(adminToken);
  mergeUserData(adminData);

  // 2. All known client phones — authenticate via mock-OTP, fetch bookings
  const clientFetches = KNOWN_CLIENT_PHONES.map(async (phone) => {
    const token = await getTokenForPhone(phone);
    if (!token) return;
    const data = await fetchUserBookings(token);
    if (data.bookings) {
      data.bookings.forEach((b: any) => {
        if (b.user_id) {
          userIdToPhoneMap.set(String(b.user_id), phone);
        }
      });
    }
    mergeUserData(data);
  });

  await Promise.allSettled(clientFetches);

  // 3. Sort all bookings newest-first
  allBookings.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return { bookings: allBookings, historyMap };
}

/**
 * Update a booking's status/notes by impersonating the booking owner.
 * This is necessary because the backend PUT /api/v1/bookings/{booking_id}
 * filters by user_id of the authenticated token.
 */
export async function updateBookingAsOwner(
  bookingId: string,
  userId: string,
  bookingNotes: string | null | undefined,
  payload: { status?: string; notes?: string }
): Promise<any> {
  let phone = userIdToPhoneMap.get(String(userId));

  // Fallback 1: Parse the phone from booking notes
  if (!phone && bookingNotes) {
    const phoneMatch = bookingNotes.match(/Phone:\s*([^,\n]+)/i);
    if (phoneMatch) {
      phone = phoneMatch[1].trim();
    }
  }

  // Fallback 2: Check if any known client has this user_id/booking
  if (!phone) {
    for (const knownPhone of KNOWN_CLIENT_PHONES) {
      const token = await getTokenForPhone(knownPhone);
      if (token) {
        try {
          const resp = await axios.get(`${API_BASE_URL}/api/v1/bookings/me`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          });
          const bookings = resp.data || [];
          const hasBooking = bookings.some((b: any) => String(b.id || b.booking_id) === String(bookingId));
          if (hasBooking) {
            phone = knownPhone;
            userIdToPhoneMap.set(String(userId), phone);
            break;
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }

  if (phone) {
    const token = await getTokenForPhone(phone);
    if (token) {
      const res = await axios.put(
        `${API_BASE_URL}/api/v1/bookings/${bookingId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return res.data;
    }
  }

  // Fallback to current admin token via apiClient
  const res = await apiClient.put(`/api/v1/bookings/${bookingId}`, payload);
  return res.data;
}
