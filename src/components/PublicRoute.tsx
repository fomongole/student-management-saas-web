import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

interface PublicRouteProps {
  children?: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    // If they are already logged in, kick them to the dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, let them see the login page
  return children ? <>{children}</> : <Outlet />;
}