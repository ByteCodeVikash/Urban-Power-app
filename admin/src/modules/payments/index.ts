import React from 'react';
import { Module } from '../registry';

const Payments = React.lazy(() => import('../../pages/Payments').then((m) => ({ default: m.Payments })));

export const PaymentsModule: Module = {
  id: 'payments',
  name: 'Payments',
  routes: [
    {
      path: '/payments',
      element: Payments,
      requiredPermission: 'payments.view',
    },
  ],
  menuItems: [
    {
      title: 'Payments',
      icon: 'Payment',
      route: '/payments',
      permission: 'payments.view',
    },
  ],
  dashboardWidgets: [
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      component: React.lazy(() =>
        import('./widgets/TotalRevenueWidget').then((m) => ({ default: m.TotalRevenueWidget }))
      ),
    },
  ],
};

export default PaymentsModule;
