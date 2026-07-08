import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { ShoppingBag as OrderIcon } from '@mui/icons-material';
import { useAdminOrderStats } from '../../../hooks/useAdminOrders';

export const TotalOrdersWidget: React.FC = () => {
  const { data: stats, isLoading } = useAdminOrderStats();

  const displayValue = isLoading
    ? '...'
    : (stats?.total_all ?? 0).toLocaleString();

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
