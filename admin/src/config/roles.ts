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
  Admin: [
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
  Dispatcher: [
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
  'Content Manager': ['dashboard.view', 'services.manage', 'cms.manage'],
};

export const hasPermission = (
  userRole: string,
  requiredPermission: Permission,
): boolean => {
  // Map backend roles (case-insensitive) to frontend Role types
  let mappedRole = userRole;
  const normalized = userRole.toLowerCase().trim();
  if (normalized === 'admin') {
    mappedRole = 'Admin';
  } else if (normalized === 'super admin' || normalized === 'super_admin') {
    mappedRole = 'Super Admin';
  } else if (normalized === 'operations manager' || normalized === 'operations_manager') {
    mappedRole = 'Operations Manager';
  } else if (normalized === 'dispatcher') {
    mappedRole = 'Dispatcher';
  } else if (normalized === 'finance manager' || normalized === 'finance_manager') {
    mappedRole = 'Finance Manager';
  } else if (normalized === 'support executive' || normalized === 'support_executive') {
    mappedRole = 'Support Executive';
  } else if (normalized === 'technician manager' || normalized === 'technician_manager') {
    mappedRole = 'Technician Manager';
  } else if (normalized === 'content manager' || normalized === 'content_manager') {
    mappedRole = 'Content Manager';
  }

  // Safe cast since roles can be arbitrary strings from future DB migrations
  const role = mappedRole as Role;
  if (role === 'Super Admin') return true;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(requiredPermission);
};
