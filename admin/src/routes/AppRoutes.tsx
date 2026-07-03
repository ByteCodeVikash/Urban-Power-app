import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PermissionGuard } from './PermissionGuard';
import { ModuleRegistry } from '../modules';
import { Box, CircularProgress } from '@mui/material';

// Dynamic lazy loading of core system pages
const Login = React.lazy(() => import('../pages/Login').then((m) => ({ default: m.Login })));
const Dashboard = React.lazy(() => import('../pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Profile = React.lazy(() => import('../pages/Profile').then((m) => ({ default: m.Profile })));
const NotFound = React.lazy(() => import('../pages/NotFound').then((m) => ({ default: m.NotFound })));

const RouteSuspenseLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      width: '100%',
    }}
  >
    <CircularProgress color="primary" />
  </Box>
);

export const AppRoutes: React.FC = () => {
  return (
    <React.Suspense fallback={<RouteSuspenseLoader />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Admin Console Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Core pages */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* Dynamic Module Routes */}
            {ModuleRegistry.getRoutes().map((route) => {
              const Component = route.element;
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <PermissionGuard requiredPermission={route.requiredPermission}>
                      <Component />
                    </PermissionGuard>
                  }
                />
              );
            })}
            
            {/* Catch-all for inside the admin layout */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        {/* Root level redirects */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
};
export default AppRoutes;

