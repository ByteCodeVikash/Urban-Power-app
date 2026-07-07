import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';
import { useBookings } from '../../../hooks/useBookings';

export const AverageOrderValueWidget: React.FC = () => {
  const { data: bookings, isLoading } = useBookings();

  const nonCancelled = bookings ? bookings.filter(b => b.status !== 'cancelled') : [];
  const total = nonCancelled.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const aov = nonCancelled.length > 0 ? Math.round(total / nonCancelled.length) : 0;

  const displayValue = isLoading ? '...' : `₹${aov.toLocaleString()}`;

  return (
    <StatCard
      title="Average Order Value"
      value={displayValue}
      icon={<MoneyIcon />}
      color="#805AD5"
      dataSource={{ type: 'real' }}
    />
  );
};

export default AverageOrderValueWidget;
