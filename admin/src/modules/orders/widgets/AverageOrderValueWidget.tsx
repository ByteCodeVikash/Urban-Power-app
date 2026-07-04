import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';

export const AverageOrderValueWidget: React.FC = () => {
  return (
    <StatCard
      title="Average Order Value"
      value="₹1,850"
      icon={<MoneyIcon />}
      color="#805AD5"
      change={{ value: '5%', type: 'increase' }}
    />
  );
};

export default AverageOrderValueWidget;
//
