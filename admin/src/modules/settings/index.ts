import React from 'react';
import { Module } from '../registry';

const Settings = React.lazy(() => import('../../pages/Settings').then((m) => ({ default: m.Settings })));

export const SettingsModule: Module = {
  id: 'settings',
  name: 'System Settings',
  routes: [
    {
      path: '/settings',
      element: Settings,
      requiredPermission: 'settings.manage',
    },
  ],
  menuItems: [
    {
      title: 'Settings',
      icon: 'Settings',
      route: '/settings',
      permission: 'settings.manage',
    },
  ],
};

export default SettingsModule;
