import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Refresh as RefreshIcon,
  TrendingUp as RevenueIcon,
  Receipt as OrdersIcon,
  People as UsersIcon,
  Category as ServicesIcon,
  Engineering as TechniciansIcon,
  CurrencyRupee as RupeeIcon,
} from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';

// Hooks
import { useBookings, type Booking } from '../hooks/useBookings';
import { usePayments } from '../hooks/usePayments';
import { useUsers, type UserProfile } from '../hooks/useUsers';
import { useTechnicians, type Technician } from '../hooks/useTechnicians';
import { useServices } from '../hooks/useServices';


// Components
import StatCard from '../components/common/StatCard';
import ExportButton from '../components/common/ExportButton';

// Styling / Colors
const COLORS = ['#212529', '#FAD02C', '#3182CE', '#ED64A6', '#48BB78', '#9B2C2C', '#805AD5'];

interface ChartDataPoint {
  name: string;
  revenue: number;
  orders: number;
  dateObj?: Date;
}

// ─── Timeframe Helpers ────────────────────────────────────────────────────────
const filterBookingsByTimeframe = (bookings: Booking[], timeframe: string): Booking[] => {
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let startDate: Date;

  if (timeframe === '7_days') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0);
  } else if (timeframe === '30_days') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0);
  } else if (timeframe === '6_months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate(), 0, 0, 0, 0);
  } else if (timeframe === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  } else {
    return bookings;
  }

  return bookings.filter(b => {
    if (!b.booking_date) return false;
    const bDate = new Date(b.booking_date);
    return bDate >= startDate && bDate <= todayEnd;
  });
};

const getChartDataForTimeframe = (bookings: Booking[], timeframe: string): ChartDataPoint[] => {
  const now = new Date();
  const dataPoints: ChartDataPoint[] = [];

  if (timeframe === '7_days') {
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'numeric', day: 'numeric' });
      dataPoints.push({ name: label, revenue: 0, orders: 0, dateObj: d });
    }
  } else if (timeframe === '30_days') {
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      dataPoints.push({ name: label, revenue: 0, orders: 0, dateObj: d });
    }
  } else if (timeframe === '6_months') {
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      dataPoints.push({ name: label, revenue: 0, orders: 0, dateObj: d });
    }
  } else {
    // Year to Date
    const currentMonth = now.getMonth();
    for (let m = 0; m <= currentMonth; m++) {
      const d = new Date(now.getFullYear(), m, 1);
      const label = d.toLocaleDateString('en-IN', { month: 'short' });
      dataPoints.push({ name: label, revenue: 0, orders: 0, dateObj: d });
    }
  }

  // Populate data points
  bookings.forEach(b => {
    if (!b.booking_date) return;
    const bDate = new Date(b.booking_date);
    const amount = Number(b.total_price) || 0;
    const isRevenue = b.status === 'completed' || b.status === 'confirmed';

    const match = dataPoints.find(dp => {
      if (!dp.dateObj) return false;
      if (timeframe === '7_days' || timeframe === '30_days') {
        return (
          dp.dateObj.getFullYear() === bDate.getFullYear() &&
          dp.dateObj.getMonth() === bDate.getMonth() &&
          dp.dateObj.getDate() === bDate.getDate()
        );
      } else {
        return (
          dp.dateObj.getFullYear() === bDate.getFullYear() &&
          dp.dateObj.getMonth() === bDate.getMonth()
        );
      }
    });

    if (match) {
      match.orders += 1;
      if (isRevenue) {
        match.revenue += amount;
      }
    }
  });

  return dataPoints;
};

export const Reports: React.FC = () => {
  const queryClient = useQueryClient();
  const [timeframe, setTimeframe] = useState('6_months');
  const [activeTab, setActiveTab] = useState(0);

  // Load Real Roster Data
  const { data: bookings = [], isLoading: bookingsLoading, isError: bookingsError } = useBookings();
  const { summary: paymentsSummary, isLoading: paymentsLoading } = usePayments();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: technicians = [], isLoading: techniciansLoading } = useTechnicians();
  const { data: servicesData, isLoading: servicesLoading } = useServices();

  const allServices = useMemo(() => servicesData?.allServices ?? [], [servicesData]);

  const isLoading = bookingsLoading || paymentsLoading || usersLoading || techniciansLoading || servicesLoading;

  // Build service domain mapping dictionary
  const serviceDomainMap = useMemo(() => {
    const map = new Map<string, string>();
    allServices.forEach(s => {
      map.set(s.id, s.domain);
      map.set(s.name.toLowerCase(), s.domain);
    });
    return map;
  }, [allServices]);

  const getBookingDomain = useMemo(() => {
    return (booking: Booking): string => {
      let d = serviceDomainMap.get(booking.service_id);
      if (d) return d;
      
      if (booking.service_name) {
        d = serviceDomainMap.get(booking.service_name.toLowerCase());
        if (d) return d;
        
        // Intelligent fallback parser
        const nameLower = booking.service_name.toLowerCase();
        if (
          nameLower.includes('scrap') ||
          nameLower.includes('paper') ||
          nameLower.includes('bottle') ||
          nameLower.includes('metal') ||
          nameLower.includes('tv') ||
          nameLower.includes('fridge') ||
          nameLower.includes('battery')
        )
          return 'Scrap';
        if (
          nameLower.includes('facial') ||
          nameLower.includes('wax') ||
          nameLower.includes('hair') ||
          nameLower.includes('makeup') ||
          nameLower.includes('spa') ||
          nameLower.includes('pedicure') ||
          nameLower.includes('manicure')
        )
          return 'Beautician';
        if (
          nameLower.includes('ac') ||
          nameLower.includes('repair') ||
          nameLower.includes('clean') ||
          nameLower.includes('install') ||
          nameLower.includes('electrical') ||
          nameLower.includes('fan') ||
          nameLower.includes('tap') ||
          nameLower.includes('plumb')
        )
          return 'Maintenance';
      }
      return 'Maintenance'; // default category
    };
  }, [serviceDomainMap]);

  // Derived filtered metrics
  const filteredBookings = useMemo(() => {
    return filterBookingsByTimeframe(bookings, timeframe);
  }, [bookings, timeframe]);

  const chartData = useMemo(() => {
    return getChartDataForTimeframe(filteredBookings, timeframe);
  }, [filteredBookings, timeframe]);

  // Refresh Roster Handler
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    queryClient.invalidateQueries({ queryKey: ['payments-derived'] });
    queryClient.invalidateQueries({ queryKey: ['users-derived'] });
    queryClient.invalidateQueries({ queryKey: ['technicians'] });
    queryClient.invalidateQueries({ queryKey: ['services-all'] });
  };

  // Format Helper
  const formatCurrency = (val: number) => {
    return `₹${new Intl.NumberFormat('en-IN').format(Math.round(val))}`;
  };

  // =========================================================================
  // 1. REVENUE REPORT METRICS
  // =========================================================================
  const revenueMetrics = useMemo(() => {
    const paid = filteredBookings.filter(b => b.status === 'completed' || b.status === 'confirmed');
    const total = paid.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
    const aov = paid.length > 0 ? total / paid.length : 0;

    let razorpay = 0;
    let cod = 0;
    paid.forEach(b => {
      const gateway = b.payment_method?.toLowerCase() || '';
      if (gateway === 'razorpay' || gateway === 'card' || gateway === 'upi') {
        razorpay += Number(b.total_price) || 0;
      } else if (gateway === 'cod' || gateway === 'cash') {
        cod += Number(b.total_price) || 0;
      }
    });

    // Payment Mode Distribution
    const paymentModeData = [
      { name: 'Razorpay Online', value: razorpay },
      { name: 'COD Cash', value: cod },
      { name: 'Other Channels', value: Math.max(0, total - razorpay - cod) },
    ].filter(d => d.value > 0);

    // Revenue by Category (Domain)
    let scrap = 0;
    let beautician = 0;
    let maintenance = 0;
    paid.forEach(b => {
      const d = getBookingDomain(b);
      if (d === 'Scrap') scrap += Number(b.total_price) || 0;
      else if (d === 'Beautician') beautician += Number(b.total_price) || 0;
      else maintenance += Number(b.total_price) || 0;
    });

    const categoryRevenueData = [
      { name: 'Scrap', revenue: scrap },
      { name: 'Beautician', revenue: beautician },
      { name: 'Maintenance', revenue: maintenance },
    ];

    return { total, aov, razorpay, cod, paymentModeData, categoryRevenueData };
  }, [filteredBookings, getBookingDomain]);

  // =========================================================================
  // 2. ORDERS REPORT METRICS
  // =========================================================================
  const ordersMetrics = useMemo(() => {
    const total = filteredBookings.length;
    const completed = filteredBookings.filter(b => b.status === 'completed').length;
    const pending = filteredBookings.filter(b => b.status === 'pending' || b.status === 'scheduled').length;
    const cancelled = filteredBookings.filter(b => b.status === 'cancelled').length;

    // Status breakdown data
    const statusCounts: Record<string, number> = {};
    filteredBookings.forEach(b => {
      const label = b.status.charAt(0).toUpperCase() + b.status.slice(1);
      statusCounts[label] = (statusCounts[label] || 0) + 1;
    });
    const statusSplitData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // Domain breakdown data
    let scrap = 0;
    let beautician = 0;
    let maintenance = 0;
    filteredBookings.forEach(b => {
      const d = getBookingDomain(b);
      if (d === 'Scrap') scrap++;
      else if (d === 'Beautician') beautician++;
      else maintenance++;
    });
    const domainSplitData = [
      { name: 'Scrap', value: scrap },
      { name: 'Beautician', value: beautician },
      { name: 'Maintenance', value: maintenance },
    ].filter(d => d.value > 0);

    return { total, completed, pending, cancelled, statusSplitData, domainSplitData };
  }, [filteredBookings, getBookingDomain]);

  // =========================================================================
  // 3. USERS REPORT METRICS
  // =========================================================================
  const usersMetrics = useMemo(() => {
    const customerIdsSet = new Set(filteredBookings.map(b => b.user_id).filter(Boolean));
    const totalUsers = customerIdsSet.size;

    const activeCustomersSet = new Set(
      filteredBookings
        .filter(b => b.status === 'completed' || b.status === 'confirmed')
        .map(b => b.user_id)
        .filter(Boolean)
    );
    const activeUsers = activeCustomersSet.size;
    const averageSpend = totalUsers > 0 ? revenueMetrics.total / totalUsers : 0;

    // New registrations count based on timeframe
    const now = new Date();
    let startDate: Date;
    if (timeframe === '7_days') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    else if (timeframe === '30_days') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    else if (timeframe === '6_months') startDate = new Date(now.getFullYear(), now.getMonth() - 6);
    else startDate = new Date(now.getFullYear(), 0, 1);

    const newUsers = users.filter(u => {
      if (!u.joined) return false;
      const joinedDate = new Date(u.joined);
      return joinedDate >= startDate && joinedDate <= now;
    }).length;

    // Signup Trend data
    const userSignupTrend = (() => {
      const dataPointsMap: Record<string, number> = {};
      chartData.forEach(dp => {
        dataPointsMap[dp.name] = 0;
      });

      users.forEach(u => {
        if (!u.joined) return;
        const uDate = new Date(u.joined);
        let key = '';

        if (timeframe === '7_days' || timeframe === '30_days') {
          key = uDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        } else if (timeframe === '6_months') {
          key = uDate.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        } else {
          key = uDate.toLocaleDateString('en-IN', { month: 'short' });
        }

        if (dataPointsMap[key] !== undefined) {
          dataPointsMap[key]++;
        }
      });

      return Object.entries(dataPointsMap).map(([name, count]) => ({ name, count }));
    })();

    // Top Customers table data
    const spendMap = new Map<string, { name: string; phone: string; bookings: number; spend: number; lastDate: string }>();
    filteredBookings.forEach(b => {
      const uid = b.user_id;
      if (!uid) return;
      
      const price = Number(b.total_price) || 0;
      const isRevenue = b.status === 'completed' || b.status === 'confirmed';

      if (!spendMap.has(uid)) {
        spendMap.set(uid, {
          name: b.customer_name || 'Customer',
          phone: b.customer_phone || '—',
          bookings: 0,
          spend: 0,
          lastDate: b.booking_date,
        });
      }

      const client = spendMap.get(uid)!;
      client.bookings++;
      if (isRevenue) client.spend += price;
      if (b.booking_date > client.lastDate) client.lastDate = b.booking_date;
    });

    const topCustomers = Array.from(spendMap.values())
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10);

    return { totalUsers, activeUsers, newUsers, averageSpend, userSignupTrend, topCustomers };
  }, [filteredBookings, users, timeframe, chartData, revenueMetrics.total]);

  // =========================================================================
  // 4. SERVICES REPORT METRICS
  // =========================================================================
  const servicesMetrics = useMemo(() => {
    const totalServices = allServices.length;

    // Service performance stats mapping
    const serviceMap = new Map<string, { name: string; category: string; domain: string; price: number; orders: number; revenue: number }>();
    
    // Initialize catalog
    allServices.forEach(s => {
      serviceMap.set(s.name.toLowerCase(), {
        name: s.name,
        category: s.categoryName,
        domain: s.domain,
        price: s.price,
        orders: 0,
        revenue: 0,
      });
    });

    // Accumulate bookings data
    filteredBookings.forEach(b => {
      const key = b.service_name?.toLowerCase();
      if (!key) return;

      const price = Number(b.total_price) || 0;
      const isRevenue = b.status === 'completed' || b.status === 'confirmed';

      if (!serviceMap.has(key)) {
        serviceMap.set(key, {
          name: b.service_name || '',
          category: 'General',
          domain: getBookingDomain(b),
          price: price,
          orders: 0,
          revenue: 0,
        });
      }

      const svc = serviceMap.get(key)!;
      svc.orders++;
      if (isRevenue) svc.revenue += price;
    });

    const servicesList = Array.from(serviceMap.values()).sort((a, b) => b.orders - a.orders);

    let topSvcName = '—';
    let topSvcCount = 0;
    let topGrossingName = '—';
    let topGrossingVal = 0;

    servicesList.forEach(s => {
      if (s.orders > topSvcCount) {
        topSvcCount = s.orders;
        topSvcName = s.name;
      }
      if (s.revenue > topGrossingVal) {
        topGrossingVal = s.revenue;
        topGrossingName = s.name;
      }
    });

    // Top 5 Performing Services data for chart
    const topServicesData = servicesList.slice(0, 5).map(s => ({ name: s.name, orders: s.orders }));

    return { totalServices, topSvcName, topGrossingName, servicesList, topServicesData };
  }, [allServices, filteredBookings, getBookingDomain]);

  // =========================================================================
  // 5. TECHNICIANS REPORT METRICS
  // =========================================================================
  const techniciansMetrics = useMemo(() => {
    const rosterSize = technicians.length;
    const available = technicians.filter(t => t.isAvailable).length;

    // Technician Performance mapping
    const techPerformanceMap = new Map<string, { name: string; phone: string; domain: string; completed: number; status: string; revenue: number }>();

    // Initialize with live technicians
    technicians.forEach(t => {
      techPerformanceMap.set(t.name.toLowerCase(), {
        name: t.name,
        phone: t.phone,
        domain: t.service,
        completed: 0,
        status: t.isAvailable ? 'Available' : 'Busy',
        revenue: 0,
      });
    });

    // Accumulate actual booking jobs
    filteredBookings.forEach(b => {
      const name = b.technician;
      if (!name || name === 'None') return;
      const key = name.toLowerCase();

      const price = Number(b.total_price) || 0;
      const isCompleted = b.status === 'completed';

      if (!techPerformanceMap.has(key)) {
        techPerformanceMap.set(key, {
          name,
          phone: '—',
          domain: getBookingDomain(b),
          completed: 0,
          status: 'Unknown',
          revenue: 0,
        });
      }

      const tech = techPerformanceMap.get(key)!;
      if (isCompleted) {
        tech.completed++;
        tech.revenue += price;
      }
    });

    const techniciansList = Array.from(techPerformanceMap.values()).sort((a, b) => b.completed - a.completed);

    const activeTechs = techniciansList.filter(t => t.completed > 0).length;
    const totalJobs = filteredBookings.filter(b => b.status === 'completed').length;
    const avgJobs = rosterSize > 0 ? totalJobs / rosterSize : 0;

    const techJobsChartData = techniciansList.map(t => ({ name: t.name, jobs: t.completed }));

    return { rosterSize, activeTechs, available, avgJobs, techniciansList, techJobsChartData };
  }, [technicians, filteredBookings, getBookingDomain]);

  // ── Rendering Loading / Error ───────────────────────────────────────────
  if (isLoading && bookings.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={45} sx={{ color: '#FAD02C' }} />
      </Box>
    );
  }

  if (bookingsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={<IconButton onClick={handleRefresh}><RefreshIcon /></IconButton>}>
          Failed to fetch reports data. Please ensure the backend is running.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontFamily: '"Outfit", sans-serif',
              color: '#1A202C',
            }}
          >
            Analytics & Performance Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visual statistics, dynamic timeframe filtering, and core performance audits.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Tooltip title="Refresh live data">
            <IconButton onClick={handleRefresh} size="small">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <TextField
            select
            size="small"
            label="Timeframe"
            value={timeframe}
            onChange={e => setTimeframe(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="7_days">Last 7 Days</MenuItem>
            <MenuItem value="30_days">Last 30 Days</MenuItem>
            <MenuItem value="6_months">Last 6 Months</MenuItem>
            <MenuItem value="year">Year to Date</MenuItem>
          </TextField>
        </Box>
      </Box>

      {/* Tabs Menu Panel */}
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_e, v) => setActiveTab(v)}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontSize: '0.9rem',
              fontWeight: 700,
              minHeight: 52,
            },
          }}
        >
          <Tab icon={<RevenueIcon />} iconPosition="start" label="Revenue" />
          <Tab icon={<OrdersIcon />} iconPosition="start" label="Orders" />
          <Tab icon={<UsersIcon />} iconPosition="start" label="Users" />
          <Tab icon={<ServicesIcon />} iconPosition="start" label="Services" />
          <Tab icon={<TechniciansIcon />} iconPosition="start" label="Technicians" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Total Revenue"
                value={formatCurrency(revenueMetrics.total)}
                icon={<RupeeIcon />}
                color="#48BB78"
                dataSource={{ type: 'real' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Average Order Value"
                value={formatCurrency(revenueMetrics.aov)}
                icon={<RevenueIcon />}
                color="#3182CE"
                dataSource={{ type: 'real' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Online Payments"
                value={formatCurrency(revenueMetrics.razorpay)}
                icon={<RupeeIcon />}
                color="#FAD02C"
                textColor="#212529"
                dataSource={{ type: 'real' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Cash On Delivery"
                value={formatCurrency(revenueMetrics.cod)}
                icon={<RupeeIcon />}
                color="#2D3748"
                dataSource={{ type: 'real' }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Revenue Area Chart */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontFamily: '"Outfit", sans-serif' }}>
                    Revenue Growth Trend (₹)
                  </Typography>
                  <Box sx={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#48BB78" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#48BB78" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" stroke="#718096" fontSize={11} />
                        <YAxis stroke="#718096" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                        <ChartTooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                        <Area type="monotone" dataKey="revenue" stroke="#48BB78" strokeWidth={2} fill="url(#revGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Split Charts */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontFamily: '"Outfit", sans-serif' }}>
                    Payment Gateways
                  </Typography>
                  {revenueMetrics.paymentModeData.length === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                      <Typography color="text.secondary">No transactional data</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={revenueMetrics.paymentModeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {revenueMetrics.paymentModeData.map((_entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue by domain */}
            <Grid size={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontFamily: '"Outfit", sans-serif' }}>
                    Revenue Streams by Domain
                  </Typography>
                  <Box sx={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={revenueMetrics.categoryRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" stroke="#718096" fontSize={12} />
                        <YAxis stroke="#718096" fontSize={12} tickFormatter={(val) => `₹${val}`} />
                        <ChartTooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                        <Bar dataKey="revenue" fill="#3182CE" radius={[5, 5, 0, 0]} maxBarSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Total Bookings"
                value={ordersMetrics.total}
                icon={<OrdersIcon />}
                color="#3182CE"
                dataSource={{ type: 'real' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Completed Bookings"
                value={ordersMetrics.completed}
                icon={<OrdersIcon />}
                color="#48BB78"
                dataSource={{ type: 'real' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Pending / Scheduled"
                value={ordersMetrics.pending}
                icon={<OrdersIcon />}
                color="#FAD02C"
                textColor="#212529"
                dataSource={{ type: 'real' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Cancelled Bookings"
                value={ordersMetrics.cancelled}
                icon={<OrdersIcon />}
                color="#E53E3E"
                dataSource={{ type: 'real' }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Orders Trend */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontFamily: '"Outfit", sans-serif' }}>
                    Order Volume over Time
                  </Typography>
                  <Box sx={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" stroke="#718096" fontSize={11} />
                        <YAxis stroke="#718096" fontSize={11} />
                        <ChartTooltip />
                        <Bar dataKey="orders" fill="#212529" radius={[3, 3, 0, 0]} name="Orders" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Status distribution */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontFamily: '"Outfit", sans-serif' }}>
                    Status Breakdown
                  </Typography>
                  {ordersMetrics.statusSplitData.length === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                      <Typography color="text.secondary">No bookings found</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={ordersMetrics.statusSplitData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {ordersMetrics.statusSplitData.map((_entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Category / Domain Share */}
            <Grid size={12}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontFamily: '"Outfit", sans-serif' }}>
                    Order Share per Domain
                  </Typography>
                  {ordersMetrics.domainSplitData.length === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                      <Typography color="text.secondary">No data available</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={ordersMetrics.domainSplitData}
                            cx="50%"
                            cy="50%"
                            innerRadius={0}
                            outerRadius={95}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`}
                          >
                            {ordersMetrics.domainSplitData.map((_entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Unique Customers"
                value={usersMetrics.totalUsers}
                icon={<UsersIcon />}
                color="#3182CE"
                dataSource={{ type: 'real' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Active Customers"
                value={usersMetrics.activeUsers}
                icon={<UsersIcon />}
                color="#48BB78"
                dataSource={{ type: 'real' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="New Registrations"
                value={usersMetrics.newUsers}
                icon={<UsersIcon />}
                color="#FAD02C"
                textColor="#212529"
                dataSource={{ type: 'real' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Avg Spend / Customer"
                value={formatCurrency(usersMetrics.averageSpend)}
                icon={<RupeeIcon />}
                color="#212529"
                dataSource={{ type: 'real' }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Signups trend */}
            <Grid size={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontFamily: '"Outfit", sans-serif' }}>
                    User Growth/Signups
                  </Typography>
                  <Box sx={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={usersMetrics.userSignupTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" stroke="#718096" fontSize={11} />
                        <YAxis stroke="#718096" fontSize={11} />
                        <ChartTooltip />
                        <Bar dataKey="count" fill="#ED64A6" radius={[4, 4, 0, 0]} name="New Users" maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Customers Leaderboard */}
            <Grid size={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
                      Top Performing Customers
                    </Typography>
                    <ExportButton
                      data={usersMetrics.topCustomers}
                      headers={['name', 'phone', 'bookings', 'spend', 'lastDate']}
                      pdfHeaders={['Customer Name', 'Phone', 'Bookings Count', 'Total Spend (₹)', 'Last Activity']}
                      pdfRows={usersMetrics.topCustomers.map(c => [c.name, c.phone, c.bookings, formatCurrency(c.spend), c.lastDate])}
                      title="Top Performing Customers Report"
                      filename={`top_customers_${timeframe}`}
                    />
                  </Box>
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#F7FAFC' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 750 }}>Customer Name</TableCell>
                          <TableCell sx={{ fontWeight: 750 }}>Phone Number</TableCell>
                          <TableCell sx={{ fontWeight: 750 }} align="center">Bookings</TableCell>
                          <TableCell sx={{ fontWeight: 750 }} align="right">Total Revenue Served</TableCell>
                          <TableCell sx={{ fontWeight: 750 }} align="right">Last Booking</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {usersMetrics.topCustomers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              No customer metrics for this range.
                            </TableCell>
                          </TableRow>
                        ) : (
                          usersMetrics.topCustomers.map((c, i) => (
                            <TableRow key={i} hover>
                              <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                              <TableCell>{c.phone}</TableCell>
                              <TableCell align="center">{c.bookings}</TableCell>
                              <TableCell align="right" sx={{ color: '#48BB78', fontWeight: 700 }}>
                                {formatCurrency(c.spend)}
                              </TableCell>
                              <TableCell align="right">{c.lastDate.split('T')[0]}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard
                title="Total Services Catalog"
                value={servicesMetrics.totalServices}
                icon={<ServicesIcon />}
                color="#3182CE"
                dataSource={{ type: 'real' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard
                title="Top Service by Bookings"
                value={servicesMetrics.topSvcName}
                icon={<OrdersIcon />}
                color="#48BB78"
                dataSource={{ type: 'real' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard
                title="Top Grossing Service"
                value={servicesMetrics.topGrossingName}
                icon={<RupeeIcon />}
                color="#FAD02C"
                textColor="#212529"
                dataSource={{ type: 'real' }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Top 5 Services Chart */}
            <Grid size={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontFamily: '"Outfit", sans-serif' }}>
                    Top 5 Services by Order Volume
                  </Typography>
                  {servicesMetrics.topServicesData.length === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                      <Typography color="text.secondary">No bookings in timeframe</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={servicesMetrics.topServicesData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                          <XAxis type="number" stroke="#718096" fontSize={11} />
                          <YAxis dataKey="name" type="category" stroke="#718096" fontSize={11} width={130} />
                          <ChartTooltip />
                          <Bar dataKey="orders" fill="#FAD02C" radius={[0, 4, 4, 0]} name="Orders Count" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Services Performance Table */}
            <Grid size={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
                      Complete Service Performance
                    </Typography>
                    <ExportButton
                      data={servicesMetrics.servicesList}
                      headers={['name', 'category', 'domain', 'price', 'orders', 'revenue']}
                      pdfHeaders={['Service Name', 'Category', 'Domain', 'Base Price (₹)', 'Orders Count', 'Total Revenue (₹)']}
                      pdfRows={servicesMetrics.servicesList.map(s => [s.name, s.category, s.domain, formatCurrency(s.price), s.orders, formatCurrency(s.revenue)])}
                      title="Service Catalog Performance Report"
                      filename={`service_performance_${timeframe}`}
                    />
                  </Box>
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#F7FAFC' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 750 }}>Service Name</TableCell>
                          <TableCell sx={{ fontWeight: 750 }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: 750 }}>Domain</TableCell>
                          <TableCell sx={{ fontWeight: 750 }} align="right">Base Price</TableCell>
                          <TableCell sx={{ fontWeight: 750 }} align="center">Orders Executed</TableCell>
                          <TableCell sx={{ fontWeight: 750 }} align="right">Revenue Generated</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {servicesMetrics.servicesList.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              No services catalog data found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          servicesMetrics.servicesList.map((s, idx) => (
                            <TableRow key={idx} hover>
                              <TableCell sx={{ fontWeight: 600 }}>{s.name}</TableCell>
                              <TableCell>
                                <Chip label={s.category} size="small" variant="outlined" sx={{ fontSize: '0.72rem' }} />
                              </TableCell>
                              <TableCell>{s.domain}</TableCell>
                              <TableCell align="right">{formatCurrency(s.price)}</TableCell>
                              <TableCell align="center">{s.orders}</TableCell>
                              <TableCell align="right" sx={{ color: '#48BB78', fontWeight: 700 }}>
                                {formatCurrency(s.revenue)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 4 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Roster Size"
                value={techniciansMetrics.rosterSize}
                icon={<TechniciansIcon />}
                color="#3182CE"
                dataSource={{ type: 'real' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Active Techs"
                value={techniciansMetrics.activeTechs}
                icon={<TechniciansIcon />}
                color="#48BB78"
                dataSource={{ type: 'real' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Available Techs"
                value={techniciansMetrics.available}
                icon={<TechniciansIcon />}
                color="#FAD02C"
                textColor="#212529"
                dataSource={{ type: 'real' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Avg Jobs / Tech"
                value={techniciansMetrics.avgJobs.toFixed(1)}
                icon={<OrdersIcon />}
                color="#212529"
                dataSource={{ type: 'real' }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Technician jobs comparison */}
            <Grid size={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontFamily: '"Outfit", sans-serif' }}>
                    Completed Jobs per Technician
                  </Typography>
                  {techniciansMetrics.techJobsChartData.length === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                      <Typography color="text.secondary">No technician jobs completed</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={techniciansMetrics.techJobsChartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" stroke="#718096" fontSize={11} />
                          <YAxis stroke="#718096" fontSize={11} />
                          <ChartTooltip />
                          <Bar dataKey="jobs" fill="#3182CE" radius={[4, 4, 0, 0]} name="Jobs Completed" maxBarSize={60} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Technicians Performance Table */}
            <Grid size={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
                      Technician Roster & Audits
                    </Typography>
                    <ExportButton
                      data={techniciansMetrics.techniciansList}
                      headers={['name', 'phone', 'domain', 'completed', 'status', 'revenue']}
                      pdfHeaders={['Technician Name', 'Phone', 'Domain', 'Completed Jobs', 'Current Status', 'Revenue Served (₹)']}
                      pdfRows={techniciansMetrics.techniciansList.map(t => [t.name, t.phone, t.domain, t.completed, t.status, formatCurrency(t.revenue)])}
                      title="Technician Performance Report"
                      filename={`technician_performance_${timeframe}`}
                    />
                  </Box>
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#F7FAFC' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 750 }}>Technician Name</TableCell>
                          <TableCell sx={{ fontWeight: 750 }}>Phone Number</TableCell>
                          <TableCell sx={{ fontWeight: 750 }}>Domain</TableCell>
                          <TableCell sx={{ fontWeight: 750 }} align="center">Completed Jobs</TableCell>
                          <TableCell sx={{ fontWeight: 750 }} align="center">Current Status</TableCell>
                          <TableCell sx={{ fontWeight: 750 }} align="right">Revenue Served</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {techniciansMetrics.techniciansList.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              No technicians registered.
                            </TableCell>
                          </TableRow>
                        ) : (
                          techniciansMetrics.techniciansList.map((t, idx) => (
                            <TableRow key={idx} hover>
                              <TableCell sx={{ fontWeight: 600 }}>{t.name}</TableCell>
                              <TableCell>{t.phone}</TableCell>
                              <TableCell>{t.domain}</TableCell>
                              <TableCell align="center">{t.completed}</TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={t.status}
                                  size="small"
                                  sx={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    bgcolor: t.status === 'Available' ? 'rgba(72,187,120,0.15)' : 'rgba(237,137,54,0.15)',
                                    color: t.status === 'Available' ? '#276749' : '#C05621',
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ color: '#48BB78', fontWeight: 700 }}>
                                {formatCurrency(t.revenue)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default Reports;
