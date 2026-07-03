import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import {
  ShoppingBag as OrderIcon,
  PendingActions as PendingIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  Today as TodayIcon,
  AttachMoney as RevenueIcon,
  DeleteOutlined as ScrapIcon,
  SettingsSuggest as MaintenanceIcon,
  Face as BeauticianIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

import { ModuleRegistry } from '../modules/registry';

// Mock data for dashboard visualizations
const chartData = [
  { name: 'Mon', Revenue: 4000, Orders: 24 },
  { name: 'Tue', Revenue: 3000, Orders: 18 },
  { name: 'Wed', Revenue: 9800, Orders: 45 },
  { name: 'Thu', Revenue: 3900, Orders: 20 },
  { name: 'Fri', Revenue: 4800, Orders: 30 },
  { name: 'Sat', Revenue: 11000, Orders: 55 },
  { name: 'Sun', Revenue: 8500, Orders: 40 },
];

const categoryData = [
  { name: 'Scrap', value: 45 },
  { name: 'Maintenance', value: 30 },
  { name: 'Beautician', value: 25 },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'Vikash Kumar', type: 'Scrap', amount: '₹1,200', status: 'Completed', date: 'Today, 09:30 AM' },
  { id: 'ORD-002', customer: 'Amit Sharma', type: 'Maintenance', amount: '₹2,500', status: 'Pending', date: 'Today, 10:15 AM' },
  { id: 'ORD-003', customer: 'Priya Singh', type: 'Beautician', amount: '₹1,800', status: 'Pending', date: 'Today, 10:20 AM' },
  { id: 'ORD-004', customer: 'Rohan Verma', type: 'Scrap', amount: '₹800', status: 'Cancelled', date: 'Yesterday' },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome header info */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#1A202C' }}>
            Overview Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time analytics and operations command center.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<TrendingIcon />}
          onClick={() => navigate('/reports')}
        >
          View Full Reports
        </Button>
      </Box>

      {/* Dynamic Grid of Registered Dashboard Widgets */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {ModuleRegistry.getDashboardWidgets().map((widget) => {
          const WidgetComponent = widget.component;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={widget.id}>
              <React.Suspense
                fallback={
                  <Box
                    sx={{
                      minHeight: 120,
                      bgcolor: '#FFFFFF',
                      borderRadius: 3.5,
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CircularProgress size={24} sx={{ color: '#FAD02C' }} />
                  </Box>
                }
              >
                <WidgetComponent />
              </React.Suspense>
            </Grid>
          );
        })}
      </Grid>


      {/* Visual Analytics Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Main Revenue Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: '"Outfit", sans-serif' }}>
                Weekly Order & Revenue Statistics
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FAD02C" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FAD02C" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#718096" fontSize={12} />
                    <YAxis stroke="#718096" fontSize={12} />
                    <ChartTooltip />
                    <Area type="monotone" dataKey="Revenue" stroke="#C29D0A" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Share Chart */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: '"Outfit", sans-serif' }}>
                Category Distribution
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#718096" fontSize={12} />
                    <YAxis stroke="#718096" fontSize={12} />
                    <ChartTooltip />
                    <Legend />
                    <Bar dataKey="value" name="Share (%)" fill="#2D3748" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Operational Table Section */}
      <Grid container spacing={3}>
        <Grid size={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
                  Recent Booking Requests
                </Typography>
                <Button variant="outlined" color="secondary" onClick={() => navigate('/orders')}>
                  View All Orders
                </Button>
              </Box>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Service Type</TableCell>
                      <TableCell>Date/Time</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.type}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.amount}</TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              bgcolor:
                                order.status === 'Completed'
                                  ? 'rgba(72, 187, 120, 0.15)'
                                  : order.status === 'Pending'
                                  ? 'rgba(250, 208, 44, 0.2)'
                                  : 'rgba(245, 101, 101, 0.15)',
                              color:
                                order.status === 'Completed'
                                  ? '#276749'
                                  : order.status === 'Pending'
                                  ? '#B7791F'
                                  : '#9B2C2C',
                            }}
                          >
                            {order.status}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Dashboard;
