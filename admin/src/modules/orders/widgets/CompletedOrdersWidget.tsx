import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { CheckCircle as CompleteIcon } from '@mui/icons-material';
import { useAdminOrderStats } from '../../../hooks/useAdminOrders';

export const CompletedOrdersWidget: React.FC = () => {
  const { data: stats, isLoading } = useAdminOrderStats();

  const displayValue = isLoading
    ? '...'
    : (stats?.completed_all ?? 0).toLocaleString();

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
