/**
 * useTechnicianAssign — mutation hook for assigning, reassigning, and
 * unassigning a technician from a booking via PUT /api/v1/bookings/{id}.
 *
 * All state is stored in the booking's `notes` field using the convention
 * already established by parseBookingNotes / buildBookingNotes in useBookings.ts.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { parseBookingNotes, buildBookingNotes } from './useBookings';
import { updateBookingAsOwner } from '../api/bookingAggregator';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AssignPayload {
  bookingId: string;
  userId: string;
  /** Current raw notes string from the booking */
  currentNotes: string | null | undefined;
  /** Technician name to assign. Pass null / '' to unassign. */
  technicianName: string | null;
  /** Optionally also update status (e.g. 'assigned') */
  newStatus?: string;
}

export interface AssignResult {
  bookingId: string;
  technicianName: string | null;
  notes: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTechnicianAssign = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<AssignResult, Error, AssignPayload>({
    mutationFn: async ({ bookingId, userId, currentNotes, technicianName, newStatus }) => {
      const parsed = parseBookingNotes(currentNotes);

      // Rebuild notes with the new (or removed) technician name
      const newTechName = technicianName && technicianName.trim() !== ''
        ? technicianName.trim()
        : 'None';

      const updatedNotes = buildBookingNotes(
        parsed.customerName,
        parsed.phone,
        newTechName,
        parsed.customNotes,
      );

      const body: Record<string, any> = { notes: updatedNotes };

      // If a new status was requested (e.g. 'assigned'), include it
      if (newStatus) {
        body.status = newStatus;
      }

      await updateBookingAsOwner(bookingId, userId, currentNotes, body);

      return {
        bookingId,
        technicianName: newTechName !== 'None' ? newTechName : null,
        notes: updatedNotes,
      };
    },

    onSuccess: (_data, variables) => {
      // Invalidate both the list query and the single-booking query
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
      // Invalidate derived technician roster
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
    },
  });

  /**
   * Assign a technician to a booking.
   * Also transitions status to 'assigned' if currently 'pending' or 'confirmed'.
   */
  const assignTechnician = (
    bookingId: string,
    userId: string,
    currentNotes: string | null | undefined,
    technicianName: string,
    currentStatus?: string,
  ) => {
    const shouldUpdateStatus =
      currentStatus === 'pending' || currentStatus === 'confirmed';
    return mutation.mutateAsync({
      bookingId,
      userId,
      currentNotes,
      technicianName,
      newStatus: shouldUpdateStatus ? 'assigned' : undefined,
    });
  };

  /**
   * Reassign: same as assign — simply replaces the technician name in notes.
   */
  const reassignTechnician = (
    bookingId: string,
    userId: string,
    currentNotes: string | null | undefined,
    technicianName: string,
  ) => {
    return mutation.mutateAsync({ bookingId, userId, currentNotes, technicianName });
  };

  /**
   * Unassign: clears the technician field in notes.
   */
  const unassignTechnician = (
    bookingId: string,
    userId: string,
    currentNotes: string | null | undefined,
  ) => {
    return mutation.mutateAsync({
      bookingId,
      userId,
      currentNotes,
      technicianName: null,
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
