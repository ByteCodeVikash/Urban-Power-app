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
    },
  ],
  menuItems: [
    {
      title: 'Coupon Management',
      icon: 'LocalOffer',
      route: '/coupons',
    },
  ],
};

export default CouponsModule;
