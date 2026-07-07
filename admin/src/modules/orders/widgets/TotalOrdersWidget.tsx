import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { ShoppingBag as OrderIcon } from '@mui/icons-material';
import { useBookings } from '../../../hooks/useBookings';

export const TotalOrdersWidget: React.FC = () => {
  const { data: bookings, isLoading } = useBookings();

  const displayValue = isLoading ? '...' : (bookings?.length || 0).toLocaleString();

  return (
    <StatCard
      title="Total Orders"
      value={displayValue}
      icon={<OrderIcon />}
      color="#2D3748"
      dataSource={{ type: 'real' }}
    />
  );
};

export default TotalOrdersWidget;
