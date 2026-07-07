import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  Skeleton,
  Alert,
} from '@mui/material';
import { Warning as WarningIcon, HourglassEmpty as PendingIcon } from '@mui/icons-material';

export const LowRatedTechniciansWidget: React.FC = () => {
  // No backend ratings API exists yet.
  // When GET /api/v1/technicians/performance (or similar) is available,
  // fetch technician ratings and filter those below the threshold (e.g. < 4.0).
  const isLoading = false;

  return (
    <Card sx={{ border: '1px solid #F56565', borderRadius: 3.5, boxShadow: 'none' }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon sx={{ color: '#F56565' }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif', color: '#1A202C' }}
            >
              Low Rated Technicians
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1,
              py: 0.2,
              borderRadius: 1.5,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: 'rgba(237, 137, 54, 0.12)',
              color: '#C05621',
              border: '1px solid rgba(237, 137, 54, 0.25)',
            }}
          >
            ○ Pending API
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2].map(i => (
              <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        ) : (
          <Alert
            severity="warning"
            icon={<PendingIcon fontSize="small" />}
            sx={{ borderRadius: 2, fontSize: '0.8rem' }}
          >
            Requires <code>GET /api/v1/technicians/performance</code> API.
            No mock data is shown.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default LowRatedTechniciansWidget;
