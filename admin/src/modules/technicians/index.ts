import React from 'react';
import { Module } from '../registry';

const Technicians = React.lazy(() => import('../../pages/Technicians').then((m) => ({ default: m.Technicians })));

export const TechniciansModule: Module = {
  id: 'technicians',
  name: 'Technician Management',
  routes: [
    {
      path: '/technicians',
      element: Technicians,
      requiredPermission: 'technicians.view',
    },
  ],
  menuItems: [
    {
      title: 'Technicians',
      icon: 'Engineering',
      route: '/technicians',
      permission: 'technicians.view',
    },
  ],
  dashboardWidgets: [
    {
      id: 'active-technicians',
      title: 'Active Technicians',
      component: React.lazy(() =>
        import('./widgets/ActiveTechniciansWidget').then((m) => ({ default: m.ActiveTechniciansWidget }))
      ),
    },
  ],
};

export default TechniciansModule;
