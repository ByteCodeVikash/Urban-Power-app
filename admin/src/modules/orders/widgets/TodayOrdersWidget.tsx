import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { Today as TodayIcon } from '@mui/icons-material';

export const TodayOrdersWidget: React.FC = () => {
  return (
    <StatCard
      title="Today's Orders"
      value="18"
      icon={<TodayIcon />}
      color="#4299E1"
      change={{ value: '25%', type: 'increase' }}
    />
  );
};

export default TodayOrdersWidget;
