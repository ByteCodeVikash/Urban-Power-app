import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { Cancel as CancelIcon } from '@mui/icons-material';

export const CancelledOrdersWidget: React.FC = () => {
  return (
    <StatCard
      title="Cancelled Orders"
      value="60"
      icon={<CancelIcon />}
      color="#F56565"
      change={{ value: '1%', type: 'increase' }}
    />
  );
};

export default CancelledOrdersWidget;
