import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { ShoppingBag as OrderIcon } from '@mui/icons-material';

export const TotalOrdersWidget: React.FC = () => {
  return (
    <StatCard
      title="Total Orders"
      value="1,248"
      icon={<OrderIcon />}
      color="#2D3748"
      change={{ value: '12%', type: 'increase' }}
    />
  );
};

export default TotalOrdersWidget;
