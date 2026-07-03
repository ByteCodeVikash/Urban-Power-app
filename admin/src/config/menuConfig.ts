import type { Permission } from './roles';

export interface MenuItem {
  title: string;
  icon: string; // Will map to Material UI icons in layout
  route: string;
  permission?: Permission;
  children?: MenuItem[];
  futureModule?: boolean;
}

export const menuConfig: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'Dashboard',
    route: '/',
    permission: 'dashboard.view',
  },
  {
    title: 'Orders',
    icon: 'Receipt',
    route: '/orders',
    permission: 'orders.view',
  },
  {
    title: 'Users',
    icon: 'People',
    route: '/users',
    permission: 'users.view',
  },
  {
    title: 'Technicians',
    icon: 'Engineering',
    route: '/technicians',
    permission: 'technicians.view',
  },
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
  {
    title: 'Payments',
    icon: 'Payment',
    route: '/payments',
    permission: 'payments.view',
  },
  {
    title: 'Reports',
    icon: 'Chart',
    route: '/reports',
    permission: 'reports.view',
  },
  {
    title: 'Support Center',
    icon: 'Support',
    route: '/support',
    permission: 'support.manage',
    children: [
      {
        title: 'Tickets',
        icon: 'ConfirmationNumber',
        route: '/support/tickets',
        permission: 'support.manage',
      },
      {
        title: 'Complaints',
        icon: 'ReportProblem',
        route: '/support/complaints',
        permission: 'support.manage',
      },
      {
        title: 'Customer Feedback',
        icon: 'Feedback',
        route: '/support/feedback',
        permission: 'support.manage',
      },
      {
        title: 'Escalations',
        icon: 'Warning',
        route: '/support/escalations',
        permission: 'support.manage',
      },
    ],
  },
  {
    title: 'Coupon Management',
    icon: 'LocalOffer',
    route: '/coupons',
    permission: 'coupons.manage',
  },
  {
    title: 'CMS',
    icon: 'Web',
    route: '/cms',
    permission: 'cms.manage',
  },
  {
    title: 'Settings',
    icon: 'Settings',
    route: '/settings',
    permission: 'settings.manage',
    children: [
      {
        title: 'System Settings',
        icon: 'SettingsApplications',
        route: '/settings',
        permission: 'settings.manage',
      },
      {
        title: 'Audit Logs',
        icon: 'ReceiptLong',
        route: '/settings/audit-logs',
        permission: 'settings.manage',
      },
    ],
  },
  {
    title: 'Profile',
    icon: 'Person',
    route: '/profile',
  },
  // Future module placeholders demonstrating auto-integration
  {
    title: 'AC Repair Service',
    icon: 'AirConditioner',
    route: '/services/ac-repair',
    permission: 'services.manage',
    futureModule: true,
  },
  {
    title: 'Pest Control Service',
    icon: 'BugReport',
    route: '/services/pest-control',
    permission: 'services.manage',
    futureModule: true,
  },
];
