import React from 'react';
import type { Module } from '../registry';

const Orders = React.lazy(() =>
  import('../../pages/Orders').then(m => ({ default: m.Orders })),
);
const OrderDetails = React.lazy(() =>
  import('../../pages/OrderDetails').then(m => ({ default: m.OrderDetails })),
);

export const OrdersModule: Module = {
  id: 'orders',
  name: 'Orders',
  routes: [
    {
      path: '/orders',
      element: Orders,
      requiredPermission: 'orders.view',
    },
    {
      path: '/orders/:id',
      element: OrderDetails,
      requiredPermission: 'orders.view',
    },
  ],
  menuItems: [
    {
      title: 'Orders',
      icon: 'Receipt',
      route: '/orders',
      permission: 'orders.view',
    },
  ],
  dashboardWidgets: [
    {
      id: 'total-orders',
      title: 'Total Orders',
      component: React.lazy(() =>
        import('./widgets/TotalOrdersWidget').then(m => ({
          default: m.TotalOrdersWidget,
        })),
      ),
    },
    {
      id: 'pending-orders',
      title: 'Pending Orders',
      component: React.lazy(() =>
        import('./widgets/PendingOrdersWidget').then(m => ({
          default: m.PendingOrdersWidget,
        })),
      ),
    },
    {
      id: 'completed-orders',
      title: 'Completed Orders',
      component: React.lazy(() =>
        import('./widgets/CompletedOrdersWidget').then(m => ({
          default: m.CompletedOrdersWidget,
        })),
      ),
    },
    {
      id: 'cancelled-orders',
      title: 'Cancelled Orders',
      component: React.lazy(() =>
        import('./widgets/CancelledOrdersWidget').then(m => ({
          default: m.CancelledOrdersWidget,
        })),
      ),
    },
    {
      id: 'today-orders',
      title: "Today's Orders",
      component: React.lazy(() =>
        import('./widgets/TodayOrdersWidget').then(m => ({
          default: m.TodayOrdersWidget,
        })),
      ),
    },
    {
      id: 'average-order-value',
      title: 'Average Order Value',
      component: React.lazy(() =>
        import('./widgets/AverageOrderValueWidget').then(m => ({
          default: m.AverageOrderValueWidget,
        })),
      ),
    },
    {
      id: 'bookings-graph',
      title: 'Bookings Graph',
      component: React.lazy(() =>
        import('./widgets/BookingsGraphWidget').then(m => ({
          default: m.BookingsGraphWidget,
        })),
      ),
    },
    {
      id: 'latest-orders',
      title: 'Latest Orders',
      component: React.lazy(() =>
        import('./widgets/LatestOrdersWidget').then(m => ({
          default: m.LatestOrdersWidget,
        })),
      ),
    },
  ],
};

export default OrdersModule;
