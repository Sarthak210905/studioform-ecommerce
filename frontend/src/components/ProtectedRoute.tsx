import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

export default function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
  const { user, token } = useAuthStore();

  // isAuthenticated is a function in the store, so check user + token directly
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user?.is_superuser) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
