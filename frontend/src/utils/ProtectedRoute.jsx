import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
