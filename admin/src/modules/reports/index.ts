import React from 'react';
import type { Module } from '../registry';

const Reports = React.lazy(() => import('../../pages/Reports').then((m) => ({ default: m.Reports })));

export const ReportsModule: Module = {
  id: 'reports',
  name: 'Reports & Analytics',
  routes: [
    {
      path: '/reports',
      element: Reports,
      requiredPermission: 'reports.view',
    },
  ],
  menuItems: [
    {
      title: 'Reports',
      icon: 'Chart',
      route: '/reports',
      permission: 'reports.view',
    },
  ],
};

export default ReportsModule;
