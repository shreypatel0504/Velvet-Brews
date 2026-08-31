import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

interface RequireAuthProps {
  children: React.ReactNode;
  message?: string;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  message 
}) => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    let customMessage = message;
    if (!customMessage) {
      if (location.pathname.startsWith('/menu')) {
        customMessage = "Please log in or sign up to explore our menu & order!";
      } else if (location.pathname.startsWith('/reservation')) {
        customMessage = "Please log in or sign up to book a table reservation!";
      } else if (location.pathname.startsWith('/checkout')) {
        customMessage = "Please log in or sign up to complete your order checkout!";
      } else {
        customMessage = "Please log in or sign up to continue.";
      }
    }

    toast.error(customMessage, { id: 'auth-required-toast' });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
