import React from 'react';
import { Module } from '../registry';

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
};

export default ServicesModule;
