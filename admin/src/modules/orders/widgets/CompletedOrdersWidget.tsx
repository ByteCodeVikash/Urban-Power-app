import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { CheckCircle as CompleteIcon } from '@mui/icons-material';

export const CompletedOrdersWidget: React.FC = () => {
  return (
    <StatCard
      title="Completed Orders"
      value="1,154"
      icon={<CompleteIcon />}
      color="#48BB78"
      change={{ value: '18%', type: 'increase' }}
    />
  );
};

export default CompletedOrdersWidget;
