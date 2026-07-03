import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { TrendingUp as TrendingIcon } from '@mui/icons-material';

export const MonthlyGrowthWidget: React.FC = () => {
  return (
    <StatCard
      title="Monthly Growth"
      value="14.8%"
      icon={<TrendingIcon />}
      color="#319795"
      change={{ value: '2.5% vs last month', type: 'increase' }}
    />
  );
};

export default MonthlyGrowthWidget;
