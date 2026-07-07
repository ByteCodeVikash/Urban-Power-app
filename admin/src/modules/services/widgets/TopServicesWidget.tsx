import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import { useAdminOrderStats } from '../../../hooks/useAdminOrders';

interface ServiceStat {
  name: string;
  count: number;
  revenue: number;
  percentage: number;
  color: string;
}

const COLORS = ['#3182CE', '#48BB78', '#ED8936', '#E53E3E', '#9F7AEA'];

export const TopServicesWidget: React.FC = () => {
  const { data: stats, isLoading } = useAdminOrderStats();

  const serviceStats: ServiceStat[] = useMemo(() => {
    const list = stats?.top_services || [];
    const maxCount = list[0]?.count || 1;

    return list.map((s, i) => ({
      ...s,
      percentage: Math.round((s.count / maxCount) * 100),
      color: COLORS[i % COLORS.length],
    }));
  }, [stats]);

  return (
    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3.5, boxShadow: 'none' }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
          >
            Top Performing Services
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1,
              py: 0.2,
              borderRadius: 1.5,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: 'rgba(72, 187, 120, 0.12)',
              color: '#276749',
              border: '1px solid rgba(72, 187, 120, 0.3)',
            }}
          >
            ● Live Data
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} variant="rectangular" height={36} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        ) : serviceStats.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No booking data available to compute top services.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
            {serviceStats.map(service => (
              <Box key={service.name}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2D3748' }}>
                    {service.name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#4A5568' }}>
                    ₹{service.revenue.toLocaleString('en-IN')}{' '}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ color: 'text.secondary', fontWeight: 500 }}
                    >
                      ({service.count} jobs)
                    </Typography>
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={service.percentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#EDF2F7',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: service.color,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TopServicesWidget;
