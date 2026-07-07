import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { Today as TodayIcon } from '@mui/icons-material';
import { useAdminOrderStats } from '../../../hooks/useAdminOrders';

export const TodayOrdersWidget: React.FC = () => {
  const { data: stats, isLoading } = useAdminOrderStats();

  const displayValue = isLoading ? '...' : (stats?.today_all ?? 0).toLocaleString();

  return (
    <StatCard
      title="Today's Orders"
      value={displayValue}
      icon={<TodayIcon />}
      color="#4299E1"
      dataSource={{ type: 'real' }}
    />
  );
};

export default TodayOrdersWidget;
