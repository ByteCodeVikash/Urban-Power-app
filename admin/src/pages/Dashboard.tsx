import React, { useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Paper,
} from '@mui/material';
import { TrendingUp as TrendingIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ModuleRegistry } from '../modules/registry';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('7days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const allWidgets = ModuleRegistry.getDashboardWidgets();

  // Categorize widgets based on their functional scope/layout needs
  const kpiWidgets = allWidgets.filter(w =>
    [
      'total-orders',
      'pending-orders',
      'completed-orders',
      'cancelled-orders',
      'today-orders',
      'average-order-value',
      'total-revenue',
      'monthly-growth',
      'active-technicians',
    ].includes(w.id),
  );

  const graphWidgets = allWidgets.filter(w =>
    ['bookings-graph', 'revenue-graph', 'top-services'].includes(w.id),
  );

  const listWidgets = allWidgets.filter(w =>
    ['latest-orders', 'top-technicians', 'low-rated-technicians'].includes(
      w.id,
    ),
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome header & controls info */}
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
            Overview Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time analytics and operations command center.
          </Typography>
        </Box>

        {/* Date Range Selector Panel */}
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1,
            border: '1px solid #E2E8F0',
            borderRadius: 3,
            flexWrap: 'wrap',
          }}
        >
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              sx={{ borderRadius: 2.5, fontSize: '0.85rem' }}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>

          {dateRange === 'custom' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                type="date"
                size="small"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                    fontSize: '0.85rem',
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary">
                to
              </Typography>
              <TextField
                type="date"
                size="small"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                    fontSize: '0.85rem',
                  },
                }}
              />
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<TrendingIcon />}
            onClick={() => navigate('/reports')}
            sx={{ borderRadius: 2.5, px: 2 }}
          >
            View Full Reports
          </Button>
        </Paper>
      </Box>

      {/* KPI Metrics Dashboard Cards */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          color: '#4A5568',
          mb: 2,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}
      >
        Operational Health KPIs
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiWidgets.map(widget => {
          const WidgetComponent = widget.component;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={widget.id}>
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

      {/* Visual Analytics Graphs Section */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          color: '#4A5568',
          mb: 2,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}
      >
        System Growth & Revenue Analytics
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {graphWidgets.map(widget => {
          const WidgetComponent = widget.component;
          return (
            <Grid size={{ xs: 12, lg: 6 }} key={widget.id}>
              <React.Suspense
                fallback={
                  <Box
                    sx={{
                      minHeight: 320,
                      bgcolor: '#FFFFFF',
                      borderRadius: 3.5,
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CircularProgress size={32} sx={{ color: '#FAD02C' }} />
                  </Box>
                }
              >
                <WidgetComponent />
              </React.Suspense>
            </Grid>
          );
        })}
      </Grid>

      {/* Actionable Roster, Feedbacks, and Latest Orders Section */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          color: '#4A5568',
          mb: 2,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}
      >
        Real-time Dispatch Logs & Ratings
      </Typography>
      <Grid container spacing={3}>
        {listWidgets.map(widget => {
          const WidgetComponent = widget.component;
          return (
            <Grid size={{ xs: 12, lg: 6 }} key={widget.id}>
              <React.Suspense
                fallback={
                  <Box
                    sx={{
                      minHeight: 280,
                      bgcolor: '#FFFFFF',
                      borderRadius: 3.5,
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CircularProgress size={32} sx={{ color: '#FAD02C' }} />
                  </Box>
                }
              >
                <WidgetComponent />
              </React.Suspense>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Dashboard;
