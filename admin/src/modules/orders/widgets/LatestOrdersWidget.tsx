import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from '@mui/material';
import { useAdminOrders } from '../../../hooks/useAdminOrders';

const getStatusStyles = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === 'completed') {
    return { bgcolor: 'rgba(72, 187, 120, 0.1)', color: '#48BB78' };
  }
  if (normalized === 'pending') {
    return { bgcolor: 'rgba(237, 137, 54, 0.1)', color: '#ED8936' };
  }
  if (normalized === 'cancelled') {
    return { bgcolor: 'rgba(245, 101, 101, 0.1)', color: '#F56565' };
  }
  return { bgcolor: 'rgba(49, 130, 206, 0.1)', color: '#3182CE' };
};

const formatStatus = (status: string) => {
  if (!status) return 'Pending';
  const s = status.toLowerCase();
  if (s === 'pending') return 'Pending';
  if (s === 'completed') return 'Completed';
  if (s === 'cancelled') return 'Cancelled';
  if (s === 'assigned') return 'Assigned';
  if (s === 'confirmed') return 'Confirmed';
  if (s === 'in_progress') return 'In Progress';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const LatestOrdersWidget: React.FC = () => {
  const { data: adminOrdersData, isLoading } = useAdminOrders({ page_size: 5 });
  const recentBookings = adminOrdersData?.items || [];

  return (
    <Card
      sx={{ border: '1px solid #E2E8F0', borderRadius: 3.5, boxShadow: 'none' }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
          >
            Latest Bookings
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.2,
              borderRadius: 1.5,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: 'rgba(72, 187, 120, 0.12)',
              color: '#276749',
              border: '1px solid rgba(72, 187, 120, 0.25)',
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#48BB78',
              }}
            />
            <span>Real API</span>
          </Box>
        </Box>
        <TableContainer
          component={Paper}
          sx={{ boxShadow: 'none', border: 'none' }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Service</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    Loading bookings...
                  </TableCell>
                </TableRow>
              ) : recentBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                recentBookings.map(order => {
                  const styles = getStatusStyles(order.status);
                  const displayId = order.booking_reference || (order.booking_id ? `ORD-${order.booking_id.slice(0, 4).toUpperCase()}` : 'ORD-NEW');
                  return (
                    <TableRow
                      key={order.booking_id}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                        {displayId}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>{order.customer_name || 'Customer'}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>{order.service_name}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>₹{order.price?.toLocaleString() || 0}</TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            ...styles,
                          }}
                        >
                          {formatStatus(order.status)}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default LatestOrdersWidget;
