import React from 'react';
import type { Module } from '../registry';

const Payments = React.lazy(() =>
  import('../../pages/Payments').then(m => ({ default: m.Payments })),
);

export const PaymentsModule: Module = {
  id: 'payments',
  name: 'Payments',
  routes: [
    {
      path: '/payments',
      element: Payments,
    },
  ],
  menuItems: [
    {
      title: 'Payments',
      icon: 'Payment',
      route: '/payments',
    },
  ],
  dashboardWidgets: [
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      component: React.lazy(() =>
        import('./widgets/TotalRevenueWidget').then(m => ({
          default: m.TotalRevenueWidget,
        })),
      ),
    },
    {
      id: 'monthly-growth',
      title: 'Monthly Growth',
      component: React.lazy(() =>
        import('./widgets/MonthlyGrowthWidget').then(m => ({
          default: m.MonthlyGrowthWidget,
        })),
      ),
    },
    {
      id: 'revenue-graph',
      title: 'Revenue Graph',
      component: React.lazy(() =>
        import('./widgets/RevenueGraphWidget').then(m => ({
          default: m.RevenueGraphWidget,
        })),
      ),
    },
  ],
};

export default PaymentsModule;
