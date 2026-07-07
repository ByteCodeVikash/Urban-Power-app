import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { TrendingUp as TrendingIcon } from '@mui/icons-material';
import { useBookings } from '../../../hooks/useBookings';

export const MonthlyGrowthWidget: React.FC = () => {
  const { data: bookings = [], isLoading } = useBookings();

  let growthDisplay = '…';
  let changeVal: string | undefined;
  let changeType: 'increase' | 'decrease' = 'increase';

  if (!isLoading) {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const thisMonthCount = bookings.filter((b: any) => {
      const d = new Date(b.booking_date || b.created_at);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const lastMonthCount = bookings.filter((b: any) => {
      const d = new Date(b.booking_date || b.created_at);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    }).length;

    if (lastMonthCount === 0) {
      growthDisplay = thisMonthCount > 0 ? '+∞' : '0%';
      changeVal = undefined;
    } else {
      const pct = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
      growthDisplay = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
      changeType = pct >= 0 ? 'increase' : 'decrease';
      changeVal = `vs last month (${lastMonthCount} → ${thisMonthCount})`;
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
