import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Select, MenuItem, FormControl } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dataOptions: Record<string, { name: string; revenue: number }[]> = {
  weekly: [
    { name: 'Mon', revenue: 40000 },
    { name: 'Tue', revenue: 30000 },
    { name: 'Wed', revenue: 98000 },
    { name: 'Thu', revenue: 39000 },
    { name: 'Fri', revenue: 48000 },
    { name: 'Sat', revenue: 110000 },
    { name: 'Sun', revenue: 85000 },
  ],
  monthly: [
    { name: 'Week 1', revenue: 240000 },
    { name: 'Week 2', revenue: 280000 },
    { name: 'Week 3', revenue: 320000 },
    { name: 'Week 4', revenue: 480000 },
  ],
  yearly: [
    { name: 'Q1', revenue: 1200000 },
    { name: 'Q2', revenue: 1450000 },
    { name: 'Q3', revenue: 1980000 },
    { name: 'Q4', revenue: 2500000 },
  ],
};

export const RevenueGraphWidget: React.FC = () => {
  const [range, setRange] = useState('weekly');

  const chartData = dataOptions[range] || dataOptions.weekly;

  return (
    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3.5, boxShadow: 'none' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
            Revenue Analysis
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={range}
              onChange={(e) => setRange(e.target.value)}
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
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#48BB78" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#48BB78" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#A0AEC0" style={{ fontSize: '0.75rem' }} />
              <YAxis stroke="#A0AEC0" style={{ fontSize: '0.75rem' }} />
              <Tooltip formatter={(value) => [`₹${(value as number).toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#48BB78" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueGraphWidget;
