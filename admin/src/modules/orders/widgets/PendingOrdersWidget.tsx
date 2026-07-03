import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { PendingActions as PendingIcon } from '@mui/icons-material';

export const PendingOrdersWidget: React.FC = () => {
  return (
    <StatCard
      title="Pending Orders"
      value="34"
      icon={<PendingIcon />}
      color="#FAD02C"
      textColor="#1A202C"
      change={{ value: '4%', type: 'decrease' }}
    />
  );
};

export default PendingOrdersWidget;
