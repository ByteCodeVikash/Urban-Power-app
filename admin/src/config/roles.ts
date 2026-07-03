export type Role =
  | 'Super Admin'
  | 'Admin'
  | 'Operations Manager'
  | 'Dispatcher'
  | 'Finance Manager'
  | 'Support Executive'
  | 'Technician Manager'
  | 'Content Manager';

export type Permission =
  | 'dashboard.view'
  | 'orders.view'
  | 'orders.edit'
  | 'orders.assign'
  | 'payments.view'
  | 'payments.refund'
  | 'users.view'
  | 'users.edit'
  | 'services.manage'
  | 'settings.manage'
  | 'reports.view'
  | 'coupons.manage'
  | 'cms.manage'
  | 'support.manage'
  | 'technicians.view'
  | 'technicians.manage';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  'Super Admin': [
    'dashboard.view',
    'orders.view',
    'orders.edit',
    'orders.assign',
    'payments.view',
    'payments.refund',
    'users.view',
    'users.edit',
    'services.manage',
    'settings.manage',
    'reports.view',
    'coupons.manage',
    'cms.manage',
    'support.manage',
    'technicians.view',
    'technicians.manage',
  ],
  'Admin': [
    'dashboard.view',
    'orders.view',
    'orders.edit',
    'orders.assign',
    'payments.view',
    'users.view',
    'users.edit',
    'services.manage',
    'settings.manage',
    'reports.view',
    'coupons.manage',
    'cms.manage',
    'support.manage',
    'technicians.view',
    'technicians.manage',
  ],
  'Operations Manager': [
    'dashboard.view',
    'orders.view',
    'orders.edit',
    'orders.assign',
    'users.view',
    'services.manage',
    'technicians.view',
    'technicians.manage',
  ],
  'Dispatcher': [
    'dashboard.view',
    'orders.view',
    'orders.edit',
    'orders.assign',
    'technicians.view',
  ],
  'Finance Manager': [
    'dashboard.view',
    'payments.view',
    'payments.refund',
    'reports.view',
  ],
  'Support Executive': [
    'dashboard.view',
    'orders.view',
    'users.view',
    'support.manage',
  ],
  'Technician Manager': [
    'dashboard.view',
    'services.manage',
    'technicians.view',
    'technicians.manage',
  ],
  'Content Manager': [
    'dashboard.view',
    'services.manage',
    'cms.manage',
  ],
};

export const hasPermission = (userRole: string, requiredPermission: Permission): boolean => {
  // Safe cast since roles can be arbitrary strings from future DB migrations
  const role = userRole as Role;
  if (role === 'Super Admin') return true;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(requiredPermission);
};
