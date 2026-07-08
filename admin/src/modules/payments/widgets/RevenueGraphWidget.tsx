import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAdminOrderStats } from '../../../hooks/useAdminOrders';

export const RevenueGraphWidget: React.FC = () => {
  const [range, setRange] = useState('weekly');
  const { data: stats } = useAdminOrderStats();

  const chartData = React.useMemo(() => {
    if (!stats || !stats.graphs) {
      return [];
    }
    const graphKey =
      range === 'weekly'
        ? 'weekly'
        : range === 'monthly'
          ? 'monthly'
          : 'yearly';
    return stats.graphs[graphKey] || [];
  }, [stats, range]);

  return (
    <Card
      sx={{ border: '1px solid #E2E8F0', borderRadius: 3.5, boxShadow: 'none' }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
            >
              Revenue Analysis
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
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={range}
              onChange={e => setRange(e.target.value)}
              sx={{ borderRadius: 2, fontSize: '0.875rem' }}
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#48BB78" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#48BB78" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />
              <XAxis
                dataKey="name"
                stroke="#A0AEC0"
                style={{ fontSize: '0.75rem' }}
              />
              <YAxis stroke="#A0AEC0" style={{ fontSize: '0.75rem' }} />
              <Tooltip
                formatter={value => [
                  `₹${(value as number).toLocaleString()}`,
                  'Revenue',
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#48BB78"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueGraphWidget;
