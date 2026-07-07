import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { Cancel as CancelIcon } from '@mui/icons-material';
import { useAdminOrderStats } from '../../../hooks/useAdminOrders';

export const CancelledOrdersWidget: React.FC = () => {
  const { data: stats, isLoading } = useAdminOrderStats();

  const displayValue = isLoading ? '...' : (stats?.cancelled_all ?? 0).toLocaleString();

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
