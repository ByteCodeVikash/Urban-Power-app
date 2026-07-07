import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { PendingActions as PendingIcon } from '@mui/icons-material';
import { useBookings } from '../../../hooks/useBookings';

export const PendingOrdersWidget: React.FC = () => {
  const { data: bookings, isLoading } = useBookings();

  const pendingCount = bookings
    ? bookings.filter(
        b => b.status !== 'completed' && b.status !== 'cancelled',
      ).length
    : 0;

  const displayValue = isLoading ? '...' : pendingCount.toLocaleString();

  return (
    <StatCard
      title="Pending Orders"
      value={displayValue}
      icon={<PendingIcon />}
      color="#FAD02C"
      textColor="#1A202C"
      dataSource={{ type: 'real' }}
    />
  );
};

export default PendingOrdersWidget;
