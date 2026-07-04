import React from 'react';
import type { Module } from '../registry';

const SupportCenter = React.lazy(() =>
  import('./SupportCenter').then(m => ({ default: m.SupportCenter })),
);

export const SupportModule: Module = {
  id: 'support',
  name: 'Support Center',
  routes: [
    {
      path: '/support',
      element: SupportCenter,
      requiredPermission: 'support.manage',
    },
    {
      // Sub-route handling to support children routes
      path: '/support/tickets',
      element: SupportCenter,
      requiredPermission: 'support.manage',
    },
    {
      path: '/support/complaints',
      element: SupportCenter,
      requiredPermission: 'support.manage',
    },
    {
      path: '/support/feedback',
      element: SupportCenter,
      requiredPermission: 'support.manage',
    },
    {
      path: '/support/escalations',
      element: SupportCenter,
      requiredPermission: 'support.manage',
    },
  ],
  menuItems: [
    {
      title: 'Support Center',
      icon: 'Support',
      route: '/support',
      permission: 'support.manage',
      children: [
        {
          title: 'Tickets',
          icon: 'ConfirmationNumber',
          route: '/support/tickets',
          permission: 'support.manage',
        },
        {
          title: 'Complaints',
          icon: 'ReportProblem',
          route: '/support/complaints',
          permission: 'support.manage',
        },
        {
          title: 'Customer Feedback',
          icon: 'Feedback',
          route: '/support/feedback',
          permission: 'support.manage',
        },
        {
          title: 'Escalations',
          icon: 'Warning',
          route: '/support/escalations',
          permission: 'support.manage',
        },
      ],
    },
  ],
};

export default SupportModule;
