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
    },
    {
      // Sub-route handling to support children routes
      path: '/support/tickets',
      element: SupportCenter,
    },
    {
      path: '/support/complaints',
      element: SupportCenter,
    },
    {
      path: '/support/feedback',
      element: SupportCenter,
    },
    {
      path: '/support/escalations',
      element: SupportCenter,
    },
  ],
  menuItems: [
    {
      title: 'Support Center',
      icon: 'Support',
      route: '/support',
      children: [
        {
          title: 'Tickets',
          icon: 'ConfirmationNumber',
          route: '/support/tickets',
        },
        {
          title: 'Complaints',
          icon: 'ReportProblem',
          route: '/support/complaints',
        },
        {
          title: 'Customer Feedback',
          icon: 'Feedback',
          route: '/support/feedback',
        },
        {
          title: 'Escalations',
          icon: 'Warning',
          route: '/support/escalations',
        },
      ],
    },
  ],
};

export default SupportModule;
