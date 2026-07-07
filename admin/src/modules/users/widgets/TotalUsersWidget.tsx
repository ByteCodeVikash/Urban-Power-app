import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { People as PeopleIcon } from '@mui/icons-material';
import { useUserCount } from '../../../hooks/useUsers';

export const TotalUsersWidget: React.FC = () => {
  const { data: count, isLoading } = useUserCount();

  return (
    <StatCard
      title="Total Registered Users"
      value={isLoading ? '…' : String(count ?? 0)}
      icon={<PeopleIcon />}
      color="#319795"
      dataSource={{ type: 'real' }}
    />
  );
};

export default TotalUsersWidget;
