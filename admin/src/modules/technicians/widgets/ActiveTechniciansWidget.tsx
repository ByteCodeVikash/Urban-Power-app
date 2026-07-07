import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { Engineering as TechIcon } from '@mui/icons-material';
import { useTechnicians } from '../../../hooks/useTechnicians';

export const ActiveTechniciansWidget: React.FC = () => {
  const { data: techData = [], isLoading } = useTechnicians();
  const activeCount = isLoading ? '…' : techData.filter(t => t.isAvailable).length;

  return (
    <StatCard
      title="Active Technicians"
      value={String(activeCount)}
      icon={<TechIcon />}
      color="#48BB78"
      dataSource={{ type: 'real' }}
    />
  );
};

export default ActiveTechniciansWidget;
