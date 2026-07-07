import { useEffect, useRef } from 'react';
import { apiClient } from '../api/apiClient';
import { parseBookingNotes } from './useBookings';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';

export const useNotificationPolling = (intervalMs = 15000) => {
  const { token, isAuthenticated } = useAuthStore();
  const { setBookingBaseline, addNotification } = useNotificationStore();
  const isFirstRun = useRef(true);
  const connectionFailedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    const poll = async () => {
      try {
        const [bookingsRes, historyRes] = await Promise.all([
          apiClient.get('/api/v1/bookings/me'),
          apiClient.get('/api/v1/bookings/history'),
        ]);

        if (connectionFailedRef.current) {
          connectionFailedRef.current = false;
          addNotification({
            type: 'System Notification',
            message: 'Server connection restored.',
          });
        }

        const bookings = bookingsRes.data || [];
        const history = historyRes.data || [];

        // Map history booking_id -> service/timeslot info
        const historyMap: Record<string, any> = {};
        history.forEach((h: any) => {
          if (h.booking_id) {
            historyMap[String(h.booking_id)] = h;
          }
        });

        const newBaseline: Record<string, any> = {};

        bookings.forEach((booking: any) => {
          const bookingId = String(booking.id || booking.booking_id);
          const historyItem = historyMap[bookingId];
          const parsed = parseBookingNotes(booking.notes);
          const serviceName = historyItem?.service || 'Service Booking';

          newBaseline[bookingId] = {
            status: booking.status,
            notes: booking.notes || null,
            total_price: Number(booking.total_price) || 0,
            payment_method: booking.payment_method || null,
            booking_reference: booking.booking_reference || bookingId.slice(0, 8).toUpperCase(),
            customer_name: parsed.customerName || 'Customer',
            service_name: serviceName,
            technician: parsed.technician || 'None',
          };
        });

        // Retrieve current baseline from Zustand store directly
        const currentBaseline = useNotificationStore.getState().bookingBaseline;

        // If this is the first run, set the baseline and return (do not notify for existing data)
        if (isFirstRun.current || Object.keys(currentBaseline).length === 0) {
          setBookingBaseline(newBaseline);
          isFirstRun.current = false;

          // Welcome notification on first load
          addNotification({
            type: 'System Notification',
            message: 'Notification system initialized. Polling active.',
          });
          return;
        }

        // Compare against existing baseline
        Object.entries(newBaseline).forEach(([id, current]) => {
          const prev = currentBaseline[id];

          if (!prev) {
            // New booking!
            addNotification({
              type: 'New Order',
              message: `New ${current.service_name} Order request ${current.booking_reference} by ${current.customer_name}.`,
              meta: { bookingId: id },
            });
          } else {
            // Check status change
            if (current.status !== prev.status) {
              const ref = current.booking_reference;
              const statusLower = current.status.toLowerCase();
              if (statusLower === 'completed' || statusLower === 'confirmed') {
                const method = current.payment_method || 'Razorpay';
                addNotification({
                  type: 'Payment Success',
                  message: `Payment of ₹${current.total_price.toLocaleString('en-IN')} received for ${ref} (${method}).`,
                  meta: { bookingId: id },
                });
              } else if (statusLower === 'cancelled') {
                addNotification({
                  type: 'Refund Approved',
                  message: `Refund processed for cancelled order ${ref}.`,
                  meta: { bookingId: id },
                });
              } else {
                addNotification({
                  type: 'System Notification',
                  message: `Order ${ref} status updated to ${current.status}.`,
                  meta: { bookingId: id },
                });
              }
            }

            // Check technician change
            if (current.technician !== prev.technician) {
              const ref = current.booking_reference;
              if (prev.technician === 'None' || !prev.technician) {
                addNotification({
                  type: 'Order Assigned',
                  message: `Technician ${current.technician} assigned to order ${ref}.`,
                  meta: { bookingId: id },
                });
              } else if (current.technician === 'None' || !current.technician) {
                addNotification({
                  type: 'System Notification',
                  message: `Technician unassigned from order ${ref}.`,
                  meta: { bookingId: id },
                });
              } else {
                addNotification({
                  type: 'Technician Joined',
                  message: `Order ${ref} reassigned to ${current.technician} (was ${prev.technician}).`,
                  meta: { bookingId: id },
                });
              }
            }
          }
        });

        // Save new baseline
        setBookingBaseline(newBaseline);
      } catch (error) {
        console.error('Notification polling error:', error);
        if (!connectionFailedRef.current) {
          connectionFailedRef.current = true;
          addNotification({
            type: 'System Notification',
            message: 'Server connection lost. Unable to retrieve updates.',
          });
        }
      }
    };

    // Run first poll immediately
    poll();

    const intervalId = setInterval(poll, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, token, setBookingBaseline, addNotification, intervalMs]);
};

export default useNotificationPolling;
