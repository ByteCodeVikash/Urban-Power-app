import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { Engineering as TechIcon } from '@mui/icons-material';

export const ActiveTechniciansWidget: React.FC = () => {
  return (
    <StatCard
      title="Active Technicians"
      value="184"
      icon={<TechIcon />}
      color="#48BB78"
      change={{ value: '8%', type: 'increase' }}
    />
  );
};

export default ActiveTechniciansWidget;
// 
