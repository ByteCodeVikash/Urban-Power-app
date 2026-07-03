import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';

export const TotalRevenueWidget: React.FC = () => {
  return (
    <StatCard
      title="Total Revenue"
      value="₹4,82,900"
      icon={<MoneyIcon />}
      color="#ED8936"
      change={{ value: '24%', type: 'increase' }}
    />
  );
};

export default TotalRevenueWidget;
