import React from 'react';
import type { Module } from '../registry';

const Technicians = React.lazy(() =>
  import('../../pages/Technicians').then(m => ({ default: m.Technicians })),
);

export const TechniciansModule: Module = {
  id: 'technicians',
  name: 'Technician Management',
  routes: [
    {
      path: '/technicians',
      element: Technicians,
    },
  ],
  menuItems: [
    {
      title: 'Technicians',
      icon: 'Engineering',
      route: '/technicians',
    },
  ],
  dashboardWidgets: [
    {
      id: 'active-technicians',
      title: 'Active Technicians',
      component: React.lazy(() =>
        import('./widgets/ActiveTechniciansWidget').then(m => ({
          default: m.ActiveTechniciansWidget,
        })),
      ),
    },
    {
      id: 'top-technicians',
      title: 'Top Technicians',
      component: React.lazy(() =>
        import('./widgets/TopTechniciansWidget').then(m => ({
          default: m.TopTechniciansWidget,
        })),
      ),
    },
    {
      id: 'low-rated-technicians',
      title: 'Low Rated Technicians',
      component: React.lazy(() =>
        import('./widgets/LowRatedTechniciansWidget').then(m => ({
          default: m.LowRatedTechniciansWidget,
        })),
      ),
    },
  ],
};

export default TechniciansModule;
