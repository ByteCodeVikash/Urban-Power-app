import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { Cancel as CancelIcon } from '@mui/icons-material';
import { useBookings } from '../../../hooks/useBookings';

export const CancelledOrdersWidget: React.FC = () => {
  const { data: bookings, isLoading } = useBookings();

  const cancelledCount = bookings
    ? bookings.filter(b => b.status === 'cancelled').length
    : 0;

  const displayValue = isLoading ? '...' : cancelledCount.toLocaleString();

  return (
    <StatCard
      title="Cancelled Orders"
      value={displayValue}
      icon={<CancelIcon />}
      color="#F56565"
      dataSource={{ type: 'real' }}
    />
  );
};

export default CancelledOrdersWidget;
