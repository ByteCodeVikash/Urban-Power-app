import React from 'react';
import type { Module } from '../registry';

const CMSManager = React.lazy(() => import('./CMSManager').then((m) => ({ default: m.CMSManager })));

export const CMSModule: Module = {
  id: 'cms',
  name: 'CMS Management',
  routes: [
    {
      path: '/cms',
      element: CMSManager,
      requiredPermission: 'cms.manage',
    },
  ],
  menuItems: [
    {
      title: 'CMS',
      icon: 'Web',
      route: '/cms',
      permission: 'cms.manage',
    },
  ],
};

export default CMSModule;
