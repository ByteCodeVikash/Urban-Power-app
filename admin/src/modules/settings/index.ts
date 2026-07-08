import React from 'react';
import type { Module } from '../registry';

const Settings = React.lazy(() =>
  import('../../pages/Settings').then(m => ({ default: m.Settings })),
);
const AuditLogs = React.lazy(() =>
  import('../../pages/AuditLogs').then(m => ({ default: m.AuditLogs })),
);

export const SettingsModule: Module = {
  id: 'settings',
  name: 'System Settings',
  routes: [
    {
      path: '/settings',
      element: Settings,
    },
    {
      path: '/settings/audit-logs',
      element: AuditLogs,
    },
  ],
  menuItems: [
    {
      title: 'Settings',
      icon: 'Settings',
      route: '/settings',
    },
  ],
};

export default SettingsModule;
