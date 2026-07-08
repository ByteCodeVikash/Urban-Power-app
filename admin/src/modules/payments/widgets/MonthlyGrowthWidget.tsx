import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { TrendingUp as TrendingIcon } from '@mui/icons-material';
import { useAdminOrderStats } from '../../../hooks/useAdminOrders';

export const MonthlyGrowthWidget: React.FC = () => {
  const { data: stats, isLoading } = useAdminOrderStats();

  let growthDisplay = '…';
  let changeVal: string | undefined;
  let changeType: 'increase' | 'decrease' = 'increase';

  if (!isLoading && stats?.monthly_growth) {
    const { percentage, this_month_count, last_month_count } =
      stats.monthly_growth;
    if (last_month_count === 0) {
      growthDisplay = this_month_count > 0 ? '+100%' : '0%';
      changeVal = undefined;
    } else {
      growthDisplay = `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
      changeType = percentage >= 0 ? 'increase' : 'decrease';
      changeVal = `vs last month (${last_month_count} → ${this_month_count})`;
    }
  }

  return (
    <StatCard
      title="Monthly Growth"
      value={growthDisplay}
      icon={<TrendingIcon />}
      color="#319795"
      change={changeVal ? { value: changeVal, type: changeType } : undefined}
      dataSource={{ type: 'real' }}
    />
  );
};

export default MonthlyGrowthWidget;
