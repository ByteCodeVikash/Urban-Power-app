import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // If the admin is not logged in, redirect them to the login screen
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render the matching child route
  return <Outlet />;
};
