/**
 * useAdminOrders.ts
 *
 * React Query hooks for Admin Order Management.
 * All data is fetched via adminOrderService (real PostgreSQL, no mock data).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminOrderService,
  type AdminOrderFilters,
  type AdminOrderStatusUpdate,
} from '../api/adminOrderService';

// ─── List hook ────────────────────────────────────────────────────────────────

export const useAdminOrders = (filters: AdminOrderFilters = {}) => {
  return useQuery({
    queryKey: ['admin-orders', filters],
    queryFn: () => adminOrderService.getOrders(filters),
    // Poll every 30s for live updates
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 25_000,
    retry: 2,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10_000),
  });
};

// ─── Detail hook ──────────────────────────────────────────────────────────────

export const useAdminOrderDetail = (
  bookingType: 'beautician' | 'scrap' | 'maintenance' | null,
  bookingId: string | null,
) => {
  return useQuery({
    queryKey: ['admin-order-detail', bookingType, bookingId],
    queryFn: () => adminOrderService.getOrderDetail(bookingType!, bookingId!),
    enabled: !!bookingType && !!bookingId,
    retry: 2,
    staleTime: 10_000,
  });
};

// ─── Statistics hook ──────────────────────────────────────────────────────────

export const useAdminOrderStats = () => {
  return useQuery({
    queryKey: ['admin-order-stats'],
    queryFn: () => adminOrderService.getStatistics(),
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
};

// ─── Status update mutation ───────────────────────────────────────────────────

export const useAdminOrderStatusUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingType,
      bookingId,
      payload,
    }: {
      bookingType: 'beautician' | 'scrap' | 'maintenance';
      bookingId: string;
      payload: AdminOrderStatusUpdate;
    }) => adminOrderService.updateOrder(bookingType, bookingId, payload),

    onSuccess: (_data, variables) => {
      // Invalidate all admin order queries to reflect the change
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({
        queryKey: ['admin-order-detail', variables.bookingType, variables.bookingId],
      });
      queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] });
    },
  });
};
