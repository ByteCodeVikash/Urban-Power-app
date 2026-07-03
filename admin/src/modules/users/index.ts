import React from 'react';
import { Module } from '../registry';

const Users = React.lazy(() => import('../../pages/Users').then((m) => ({ default: m.Users })));

export const UsersModule: Module = {
  id: 'users',
  name: 'Users',
  routes: [
    {
      path: '/users',
      element: Users,
      requiredPermission: 'users.view',
    },
  ],
  menuItems: [
    {
      title: 'Users',
      icon: 'People',
      route: '/users',
      permission: 'users.view',
    },
  ],
  dashboardWidgets: [
    {
      id: 'total-users',
      title: 'Total Users',
      component: React.lazy(() =>
        import('./widgets/TotalUsersWidget').then((m) => ({ default: m.TotalUsersWidget }))
      ),
    },
  ],
};

export default UsersModule;
