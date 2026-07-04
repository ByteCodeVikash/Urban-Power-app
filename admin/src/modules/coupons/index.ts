import React from 'react';
import type { Module } from '../registry';

const CouponManager = React.lazy(() =>
  import('./CouponManager').then(m => ({ default: m.CouponManager })),
);

export const CouponsModule: Module = {
  id: 'coupons',
  name: 'Coupon Management',
  routes: [
    {
      path: '/coupons',
      element: CouponManager,
      requiredPermission: 'coupons.manage',
    },
  ],
  menuItems: [
    {
      title: 'Coupon Management',
      icon: 'LocalOffer',
      route: '/coupons',
      permission: 'coupons.manage',
    },
  ],
};

export default CouponsModule;
