import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AdminRoute = () => {
  const { user, isHRAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Verifying administrative privileges..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isHRAdmin()) {
    // Strictly prevent employees from accessing admin URLs
    return <Navigate to="/employee/dashboard" replace />;
  }

  return <Outlet />;
};
