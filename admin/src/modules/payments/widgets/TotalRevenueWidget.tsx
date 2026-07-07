import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';
import { useBookings } from '../../../hooks/useBookings';

export const TotalRevenueWidget: React.FC = () => {
  const { data: bookings, isLoading } = useBookings();

  const paidBookings = bookings
    ? bookings.filter(b => b.status === 'completed' || b.status === 'confirmed')
    : [];
  const revenue = paidBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

  const displayValue = isLoading ? '...' : `₹${revenue.toLocaleString()}`;

  return (
    <StatCard
      title="Total Revenue"
      value={displayValue}
      icon={<MoneyIcon />}
      color="#ED8936"
      dataSource={{ type: 'real' }}
    />
  );
};

export default TotalRevenueWidget;
