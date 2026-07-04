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

const dataOptions: Record<string, { name: string; bookings: number }[]> = {
  weekly: [
    { name: 'Mon', bookings: 24 },
    { name: 'Tue', bookings: 18 },
    { name: 'Wed', bookings: 45 },
    { name: 'Thu', bookings: 20 },
    { name: 'Fri', bookings: 30 },
    { name: 'Sat', bookings: 55 },
    { name: 'Sun', bookings: 40 },
  ],
  monthly: [
    { name: 'Week 1', bookings: 120 },
    { name: 'Week 2', bookings: 140 },
    { name: 'Week 3', bookings: 160 },
    { name: 'Week 4', bookings: 210 },
  ],
  yearly: [
    { name: 'Q1', bookings: 540 },
    { name: 'Q2', bookings: 620 },
    { name: 'Q3', bookings: 880 },
    { name: 'Q4', bookings: 1100 },
  ],
};

export const BookingsGraphWidget: React.FC = () => {
  const [range, setRange] = useState('weekly');

  const chartData = dataOptions[range] || dataOptions.weekly;

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
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
          >
            Bookings Growth
          </Typography>
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
