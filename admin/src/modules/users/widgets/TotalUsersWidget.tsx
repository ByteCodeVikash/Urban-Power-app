import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { People as PeopleIcon } from '@mui/icons-material';

export const TotalUsersWidget: React.FC = () => {
  return (
    <StatCard
      title="Total Registered Users"
      value="8,429"
      icon={<PeopleIcon />}
      color="#319795"
      change={{ value: '14%', type: 'increase' }}
    />
  );
};

export default TotalUsersWidget;
