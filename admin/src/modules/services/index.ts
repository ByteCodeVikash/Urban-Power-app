import React from 'react';
import type { Module } from '../registry';

const Services = React.lazy(() => import('../../pages/Services').then((m) => ({ default: m.Services })));
const Categories = React.lazy(() => import('../../pages/Categories').then((m) => ({ default: m.Categories })));

export const ServicesModule: Module = {
  id: 'services',
  name: 'Services & Catalog',
  routes: [
    {
      path: '/services',
      element: Services,
      requiredPermission: 'services.manage',
    },
    {
      path: '/categories',
      element: Categories,
      requiredPermission: 'services.manage',
    },
  ],
  menuItems: [
    {
      title: 'Services',
      icon: 'Build',
      route: '/services',
      permission: 'services.manage',
    },
    {
      title: 'Categories',
      icon: 'Category',
      route: '/categories',
      permission: 'services.manage',
    },
  ],
  dashboardWidgets: [
    {
      id: 'top-services',
      title: 'Top Services',
      component: React.lazy(() =>
        import('./widgets/TopServicesWidget').then((m) => ({ default: m.TopServicesWidget }))
      ),
    },
  ],
};

export default ServicesModule;
