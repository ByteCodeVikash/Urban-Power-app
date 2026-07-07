import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { CheckCircle as CompleteIcon } from '@mui/icons-material';
import { useBookings } from '../../../hooks/useBookings';

export const CompletedOrdersWidget: React.FC = () => {
  const { data: bookings, isLoading } = useBookings();

  const completedCount = bookings
    ? bookings.filter(b => b.status === 'completed').length
    : 0;

  const displayValue = isLoading ? '...' : completedCount.toLocaleString();

  return (
    <StatCard
      title="Completed Orders"
      value={displayValue}
      icon={<CompleteIcon />}
      color="#48BB78"
      dataSource={{ type: 'real' }}
    />
  );
};

export default CompletedOrdersWidget;
