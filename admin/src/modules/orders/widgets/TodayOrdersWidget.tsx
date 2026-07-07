import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { Today as TodayIcon } from '@mui/icons-material';
import { useBookings } from '../../../hooks/useBookings';

export const TodayOrdersWidget: React.FC = () => {
  const { data: bookings, isLoading } = useBookings();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = bookings
    ? bookings.filter(b => {
        if (!b.booking_date) return false;
        const datePart = b.booking_date.split('T')[0];
        return datePart === todayStr;
      }).length
    : 0;

  const displayValue = isLoading ? '...' : todayCount.toLocaleString();

  return (
    <StatCard
      title="Today's Orders"
      value={displayValue}
      icon={<TodayIcon />}
      color="#4299E1"
      dataSource={{ type: 'real' }}
    />
  );
};

export default TodayOrdersWidget;
