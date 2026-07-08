import React from 'react';
import type { Module } from '../registry';

const Services = React.lazy(() =>
  import('../../pages/Services').then(m => ({ default: m.Services })),
);
const Categories = React.lazy(() =>
  import('../../pages/Categories').then(m => ({ default: m.Categories })),
);

export const ServicesModule: Module = {
  id: 'services',
  name: 'Services & Catalog',
  routes: [
    {
      path: '/services',
      element: Services,
    },
    {
      path: '/categories',
      element: Categories,
    },
  ],
  menuItems: [
    {
      title: 'Services',
      icon: 'Build',
      route: '/services',
    },
    {
      title: 'Categories',
      icon: 'Category',
      route: '/categories',
    },
  ],
  dashboardWidgets: [
    {
      id: 'top-services',
      title: 'Top Services',
      component: React.lazy(() =>
        import('./widgets/TopServicesWidget').then(m => ({
          default: m.TopServicesWidget,
        })),
      ),
    },
  ],
};

export default ServicesModule;
