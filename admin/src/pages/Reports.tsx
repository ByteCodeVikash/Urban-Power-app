import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
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

// Mock Data Sets
const revenueReportData = [
  { month: 'Jan', Scrap: 24000, Maintenance: 18000, Beautician: 15000 },
  { month: 'Feb', Scrap: 28000, Maintenance: 22000, Beautician: 19000 },
  { month: 'Mar', Scrap: 35000, Maintenance: 30000, Beautician: 24000 },
  { month: 'Apr', Scrap: 30000, Maintenance: 28000, Beautician: 20000 },
  { month: 'May', Scrap: 42000, Maintenance: 35000, Beautician: 28000 },
  { month: 'Jun', Scrap: 50000, Maintenance: 45000, Beautician: 32000 },
];

const categoryDistribution = [
  { name: 'Scrap (Recycle)', orders: 480, value: 48000 },
  { name: 'Maintenance (AC/Water)', orders: 350, value: 35000 },
  { name: 'Beautician (Salon)', orders: 280, value: 28000 },
];

const paymentModeSplit = [
  { name: 'Razorpay Cards', value: 72 },
  { name: 'UPI Transactions', value: 18 },
  { name: 'COD Cash', value: 10 },
];

const COLORS = ['#2D3748', '#FAD02C', '#4A5568', '#CBD5E0'];

export const Reports: React.FC = () => {
  const [timeframe, setTimeframe] = useState('6_months');

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
            Visual statistics, monthly category performance, and client payment
            channel splits.
          </Typography>
        </Box>
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

      <Grid container spacing={3}>
        {/* Revenue Growth Graph */}
        <Grid size={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontFamily: '"Outfit", sans-serif',
                }}
              >
                Operational Revenue Streams Growth (₹)
              </Typography>
              <Box sx={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <AreaChart
                    data={revenueReportData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />
                    <XAxis dataKey="month" stroke="#718096" fontSize={12} />
                    <YAxis stroke="#718096" fontSize={12} />
                    <ChartTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="Scrap"
                      stroke="#2D3748"
                      fill="#2D3748"
                      fillOpacity={0.1}
                      name="Scrap Category (₹)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Maintenance"
                      stroke="#FAD02C"
                      fill="#FAD02C"
                      fillOpacity={0.2}
                      name="Maintenance Category (₹)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Beautician"
                      stroke="#ED64A6"
                      fill="#ED64A6"
                      fillOpacity={0.1}
                      name="Beautician Category (₹)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Categories Bar Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontFamily: '"Outfit", sans-serif',
                }}
              >
                Total Order Shares per Main Category
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={categoryDistribution}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />
                    <XAxis dataKey="name" stroke="#718096" fontSize={12} />
                    <YAxis stroke="#718096" fontSize={12} />
                    <ChartTooltip />
                    <Legend />
                    <Bar
                      dataKey="orders"
                      fill="#2D3748"
                      name="Orders Executed"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payments Pie Split */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontFamily: '"Outfit", sans-serif',
                }}
              >
                Payment Gateways Split Share (%)
              </Typography>
              <Grid container sx={{ alignItems: 'center' }} spacing={2}>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <Box sx={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={paymentModeSplit}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {paymentModeSplit.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                  >
                    {paymentModeSplit.map((mode, idx) => (
                      <Box
                        key={mode.name}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: COLORS[idx % COLORS.length],
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {mode.name} ({mode.value}%)
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Reports;
