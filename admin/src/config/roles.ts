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


