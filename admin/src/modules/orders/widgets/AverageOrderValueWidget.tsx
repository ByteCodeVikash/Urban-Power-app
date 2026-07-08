import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';
import { useAdminOrderStats } from '../../../hooks/useAdminOrders';

export const AverageOrderValueWidget: React.FC = () => {
  const { data: stats, isLoading } = useAdminOrderStats();

  const displayValue = isLoading
    ? '...'
    : `₹${(stats?.aov_all ?? 0).toLocaleString()}`;

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
