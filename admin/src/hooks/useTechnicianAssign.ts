import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminOrderService } from '../api/adminOrderService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AssignPayload {
  bookingId: string;
  bookingType: 'beautician' | 'scrap' | 'maintenance';
  /** Technician name to assign. Pass null / '' to unassign. */
  technicianName: string | null;
  /** Optionally also update status (e.g. 'assigned') */
  newStatus?: string;
  currentStatus: string;
}

export interface AssignResult {
  bookingId: string;
  technicianName: string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTechnicianAssign = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<AssignResult, Error, AssignPayload>({
    mutationFn: async ({
      bookingId,
      bookingType,
      technicianName,
      newStatus,
      currentStatus,
    }) => {
      const statusToUse = newStatus || currentStatus;

      await adminOrderService.updateOrder(bookingType, bookingId, {
        status: statusToUse,
        assigned_technician: technicianName || '',
      });

      return {
        bookingId,
        technicianName,
      };
    },

    onSuccess: (_data, variables) => {
      // Invalidate all admin order queries to reflect the change
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({
        queryKey: [
          'admin-order-detail',
          variables.bookingType,
          variables.bookingId,
        ],
      });
      queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-technicians-list'] });
      queryClient.invalidateQueries({ queryKey: ['technicians-aggregated'] });
    },
  });

  /**
   * Assign a technician to a booking.
   * Also transitions status to 'assigned' if currently 'pending' or 'confirmed'.
   */
  const assignTechnician = (
    bookingId: string,
    bookingType: 'beautician' | 'scrap' | 'maintenance',
    technicianName: string,
    currentStatus: string,
  ) => {
    const shouldUpdateStatus =
      currentStatus === 'pending' ||
      currentStatus === 'confirmed' ||
      currentStatus === 'requested';
    return mutation.mutateAsync({
      bookingId,
      bookingType,
      technicianName,
      newStatus: shouldUpdateStatus ? 'assigned' : undefined,
      currentStatus,
    });
  };

  /**
   * Reassign: same as assign — simply replaces the technician name.
   */
  const reassignTechnician = (
    bookingId: string,
    bookingType: 'beautician' | 'scrap' | 'maintenance',
    technicianName: string,
    currentStatus: string,
  ) => {
    return mutation.mutateAsync({
      bookingId,
      bookingType,
      technicianName,
      currentStatus,
    });
  };

  /**
   * Unassign: clears the technician field.
   */
  const unassignTechnician = (
    bookingId: string,
    bookingType: 'beautician' | 'scrap' | 'maintenance',
    currentStatus: string,
  ) => {
    return mutation.mutateAsync({
      bookingId,
      bookingType,
      technicianName: null,
      currentStatus,
    });
  };

  return {
    assignTechnician,
    reassignTechnician,
    unassignTechnician,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
};

export default useTechnicianAssign;
