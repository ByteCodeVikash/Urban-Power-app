import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';
import { useAdminOrderStats } from '../../../hooks/useAdminOrders';

export const TotalRevenueWidget: React.FC = () => {
  const { data: stats, isLoading } = useAdminOrderStats();

  const displayValue = isLoading
    ? '...'
    : `₹${(stats?.revenue_all ?? 0).toLocaleString()}`;

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
