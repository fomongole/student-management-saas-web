// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // Kick them out to the login page
    return <Navigate to="/login" replace />;
  }

  // If they are allowed, render the children (or the nested routes via Outlet)
  return children ? <>{children}</> : <Outlet />;
}