import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';

interface Order {
  id: string;
  customer: string;
  service: string;
  date: string;
  amount: string;
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Assigned' | 'On The Way';
}

const recentOrders: Order[] = [
  { id: 'ORD-8942', customer: 'Vijay Kumar', service: 'AC Repair', date: '2026-07-03', amount: '₹1,299', status: 'Pending' },
  { id: 'ORD-8941', customer: 'Ritu Sharma', service: 'Deep Cleaning', date: '2026-07-03', amount: '₹2,499', status: 'Assigned' },
  { id: 'ORD-8940', customer: 'Anil Gupta', service: 'Electrical Repair', date: '2026-07-03', amount: '₹450', status: 'Completed' },
  { id: 'ORD-8939', customer: 'Preeti Singh', service: 'Beautician', date: '2026-07-02', amount: '₹1,800', status: 'Completed' },
  { id: 'ORD-8938', customer: 'Rajesh Patel', service: 'Plumbing', date: '2026-07-02', amount: '₹600', status: 'Cancelled' },
];

const getStatusStyles = (status: Order['status']) => {
  switch (status) {
    case 'Completed':
      return { bgcolor: 'rgba(72, 187, 120, 0.1)', color: '#48BB78' };
    case 'Pending':
      return { bgcolor: 'rgba(237, 137, 54, 0.1)', color: '#ED8936' };
    case 'Cancelled':
      return { bgcolor: 'rgba(245, 101, 101, 0.1)', color: '#F56565' };
    default:
      return { bgcolor: 'rgba(49, 130, 206, 0.1)', color: '#3182CE' };
  }
};

export const LatestOrdersWidget: React.FC = () => {
  return (
    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3.5, boxShadow: 'none' }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: '"Outfit", sans-serif' }}>
          Latest Bookings
        </Typography>
        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: 'none' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Service</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentOrders.map((order) => {
                const styles = getStatusStyles(order.status);
                return (
                  <TableRow key={order.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600, py: 1.5 }}>{order.id}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>{order.customer}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>{order.service}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>{order.amount}</TableCell>
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
                        {order.status}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default LatestOrdersWidget;
