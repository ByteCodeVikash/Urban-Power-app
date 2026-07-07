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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useBookings } from '../../../hooks/useBookings';

export const BookingsGraphWidget: React.FC = () => {
  const [range, setRange] = useState('weekly');
  const { data: bookings = [] } = useBookings();

  const getWeeklyData = (items: any[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 } as Record<string, number>;
    items.forEach(b => {
      if (!b.booking_date) return;
      const dayName = days[new Date(b.booking_date).getDay()];
      if (counts[dayName] !== undefined) {
        counts[dayName]++;
      }
    });
    return [
      { name: 'Mon', bookings: counts.Mon },
      { name: 'Tue', bookings: counts.Tue },
      { name: 'Wed', bookings: counts.Wed },
      { name: 'Thu', bookings: counts.Thu },
      { name: 'Fri', bookings: counts.Fri },
      { name: 'Sat', bookings: counts.Sat },
      { name: 'Sun', bookings: counts.Sun },
    ];
  };

  const getMonthlyData = (items: any[]) => {
    const counts = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 } as Record<string, number>;
    items.forEach(b => {
      if (!b.booking_date) return;
      const day = new Date(b.booking_date).getDate();
      if (day <= 7) counts['Week 1']++;
      else if (day <= 14) counts['Week 2']++;
      else if (day <= 21) counts['Week 3']++;
      else counts['Week 4']++;
    });
    return [
      { name: 'Week 1', bookings: counts['Week 1'] },
      { name: 'Week 2', bookings: counts['Week 2'] },
      { name: 'Week 3', bookings: counts['Week 3'] },
      { name: 'Week 4', bookings: counts['Week 4'] },
    ];
  };

  const getYearlyData = (items: any[]) => {
    const counts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 } as Record<string, number>;
    items.forEach(b => {
      if (!b.booking_date) return;
      const month = new Date(b.booking_date).getMonth();
      if (month < 3) counts.Q1++;
      else if (month < 6) counts.Q2++;
      else if (month < 9) counts.Q3++;
      else counts.Q4++;
    });
    return [
      { name: 'Q1', bookings: counts.Q1 },
      { name: 'Q2', bookings: counts.Q2 },
      { name: 'Q3', bookings: counts.Q3 },
      { name: 'Q4', bookings: counts.Q4 },
    ];
  };

  const chartData =
    range === 'weekly'
      ? getWeeklyData(bookings)
      : range === 'monthly'
      ? getMonthlyData(bookings)
      : getYearlyData(bookings);

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
              Bookings Growth
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
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
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
              <Tooltip formatter={value => [`${value} bookings`, 'Bookings']} />
              <Bar dataKey="bookings" fill="#FAD02C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BookingsGraphWidget;
