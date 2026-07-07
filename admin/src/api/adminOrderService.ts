/**
 * adminOrderService.ts
 *
 * Centralized API service for Admin Order Management.
 * Uses the shared apiClient singleton — no duplicate Axios instances.
 *
 * All admin order endpoints use the admin's own JWT (stored in authStore).
 * No user impersonation, no mock-OTP bypass.
 */

import { apiClient } from './apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StatusHistoryItem {
  status: string;
  updated_by: string | null;
  updated_by_name: string | null;
  notes: string | null;
  created_at: string;
}

export interface AdminOrderItem {
  booking_id: string;
  booking_reference: string;
  booking_type: 'beautician' | 'scrap' | 'maintenance';
  customer_name: string | null;
  customer_phone: string | null;
  address: string | null;
  service_name: string | null;
  category: string | null;
  price: number | null;
  status: string;
  created_at: string;
  assigned_technician: string | null;
  payment_method: string | null;
}

export interface AdminOrderListResponse {
  items: AdminOrderItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AdminOrderDetail {
  booking_id: string;
  booking_reference: string;
  booking_type: 'beautician' | 'scrap' | 'maintenance';

  // Customer
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_id: string | null;

  // Address
  address: string | null;
  address_id: string | null;

  // Service
  service_name: string | null;
  service_id: string | null;
  category: string | null;

  // Scrap-specific
  item_name: string | null;
  category_name: string | null;
  estimated_weight_kg: number | null;
  estimated_value: number | null;
  time_slot: string | null;

  // Maintenance-specific
  service_names: string[] | null;
  service_ids: string[] | null;

  // Beautician-specific
  timeslot_id: string | null;
  timeslot_str: string | null;

  price: number | null;
  payment_method: string | null;
  status: string;
  assigned_technician: string | null;
  photos: string[];
  notes: string | null;

  booking_date: string | null;
  created_at: string;
  updated_at: string;

  // Timeline
  status_history: StatusHistoryItem[];
}

export interface AdminOrderStatusUpdate {
  status: string;
  notes?: string;
  assigned_technician?: string | null;
}

export interface BookingTypeStats {
  total: number;
  pending: number;
  confirmed: number;
  assigned: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

export interface MonthlyGrowthStats {
  percentage: number;
  this_month_count: number;
  last_month_count: number;
}

export interface GraphDataPoint {
  name: string;
  bookings: number;
  revenue: number;
}

export interface GraphStats {
  weekly: GraphDataPoint[];
  monthly: GraphDataPoint[];
  yearly: GraphDataPoint[];
}

export interface ServiceStatItem {
  name: string;
  count: number;
  revenue: number;
}

export interface AdminOrderStatistics {
  total_all: number;
  pending_all: number;
  confirmed_all: number;
  assigned_all: number;
  in_progress_all: number;
  completed_all: number;
  cancelled_all: number;
  revenue_all: number;
  aov_all: number;
  today_all: number;
  monthly_growth: MonthlyGrowthStats;
  graphs: GraphStats;
  top_services: ServiceStatItem[];
  beautician: BookingTypeStats;
  scrap: BookingTypeStats;
  maintenance: BookingTypeStats;
  recent_statuses: Record<string, number>;
}

export interface TechnicianOrderResponse {
  bookingId: string;
  bookingReference: string;
  status: string;
  bookingDate: string;
  serviceName: string;
  totalPrice: number;
}

export interface AdminTechnicianResponse {
  name: string;
  service: string;
  phone: string;
  isAvailable: boolean;
  jobsCompleted: number;
  assignedOrders: TechnicianOrderResponse[];
  rating: number;
}

// ─── Filter params ────────────────────────────────────────────────────────────

export interface AdminOrderFilters {
  page?: number;
  page_size?: number;
  booking_type?: string;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  customer?: string;
  phone?: string;
  category?: string;
  service_name?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const adminOrderService = {
  /**
   * GET /api/v1/admin/orders
   * Paginated, filtered, sorted list of ALL bookings.
   */
  async getOrders(filters: AdminOrderFilters = {}): Promise<AdminOrderListResponse> {
    const params: Record<string, any> = {};
    if (filters.page) params.page = filters.page;
    if (filters.page_size) params.page_size = filters.page_size;
    if (filters.booking_type) params.booking_type = filters.booking_type;
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (filters.customer) params.customer = filters.customer;
    if (filters.phone) params.phone = filters.phone;
    if (filters.category) params.category = filters.category;
    if (filters.service_name) params.service_name = filters.service_name;

    const res = await apiClient.get<AdminOrderListResponse>('/api/v1/admin/orders/', { params });
    return res.data;
  },

  /**
   * GET /api/v1/admin/orders/statistics
   * Summary counts by booking type and status.
   */
  async getStatistics(): Promise<AdminOrderStatistics> {
    const res = await apiClient.get<AdminOrderStatistics>('/api/v1/admin/orders/statistics');
    return res.data;
  },

  /**
   * GET /api/v1/admin/orders/users/count
   * Real database-backed count of registered users.
   */
  async getUsersCount(): Promise<number> {
    const res = await apiClient.get<{ count: number }>('/api/v1/admin/orders/users/count');
    return res.data.count;
  },

  /**
   * GET /api/v1/admin/orders/technicians
   * Compiles the list of technicians and their performance metrics.
   */
  async getTechnicians(): Promise<AdminTechnicianResponse[]> {
    const res = await apiClient.get<AdminTechnicianResponse[]>('/api/v1/admin/orders/technicians');
    return res.data;
  },

  /**
   * GET /api/v1/admin/orders/{booking_type}/{id}
   * Full detail for a single booking including status history.
   */
  async getOrderDetail(
    bookingType: 'beautician' | 'scrap' | 'maintenance',
    bookingId: string,
  ): Promise<AdminOrderDetail> {
    const res = await apiClient.get<AdminOrderDetail>(
      `/api/v1/admin/orders/${bookingType}/${bookingId}`,
    );
    return res.data;
  },

  /**
   * PATCH /api/v1/admin/orders/{booking_type}/{id}
   * Update status and/or technician. Stores history automatically.
   */
  async updateOrder(
    bookingType: 'beautician' | 'scrap' | 'maintenance',
    bookingId: string,
    payload: AdminOrderStatusUpdate,
  ): Promise<AdminOrderDetail> {
    const res = await apiClient.patch<AdminOrderDetail>(
      `/api/v1/admin/orders/${bookingType}/${bookingId}`,
      payload,
    );
    return res.data;
  },
};
