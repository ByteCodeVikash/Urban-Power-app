import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { PendingActions as PendingIcon } from '@mui/icons-material';
import { useAdminOrderStats } from '../../../hooks/useAdminOrders';

export const PendingOrdersWidget: React.FC = () => {
  const { data: stats, isLoading } = useAdminOrderStats();

  const displayValue = isLoading ? '...' : (stats?.pending_all ?? 0).toLocaleString();

  return (
    <StatCard
      title="Pending Orders"
      value={displayValue}
      icon={<PendingIcon />}
      color="#FAD02C"
      textColor="#1A202C"
      dataSource={{ type: 'real' }}
    />
  );
};

export default PendingOrdersWidget;
