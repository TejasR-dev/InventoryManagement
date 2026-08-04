import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // If there's a user (and token), render the child components
  // Otherwise, redirect to the login page
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;