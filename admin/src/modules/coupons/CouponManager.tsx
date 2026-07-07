import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import { HourglassEmpty as PendingIcon } from '@mui/icons-material';
import { Add as AddIcon } from '@mui/icons-material';

export const CouponManager: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Coupon Management"
        subtitle="Configure flat, percentage, and referral discounts."
        actionText="Create Coupon"
        actionIcon={<AddIcon />}
        onActionClick={() => {
          /* Pending Backend API */
        }}
      />

      <Alert
        severity="warning"
        icon={<PendingIcon />}
        sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}
      >
        <strong>Pending Backend API</strong> — No coupon/promo-code endpoint exists in the backend.
        A dedicated <code>GET /api/v1/coupons</code> API (and corresponding create / update / delete
        endpoints) is required to populate this module. Once available, integrate them here to manage
        active and expired coupons.
      </Alert>

      <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <PendingIcon sx={{ fontSize: 56, color: '#CBD5E0', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A5568', mb: 1 }}>
            Coupon List — Awaiting Backend Integration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto' }}>
            This section will display real coupon records once the backend provides
            a coupon management API. No mock data is shown.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CouponManager;
