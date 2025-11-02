import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireModerator?: boolean;
  fallbackPath?: string;
}

export default function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireModerator = false,
  fallbackPath = '/login',
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Redirect if not authenticated when auth is required
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check admin role if required
  if (requireAdmin && user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">접근 거부</h1>
          <p className="text-gray-600">관리자 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  // Check moderator role if required
  if (requireModerator && user?.role !== 'MODERATOR' && user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">접근 거부</h1>
          <p className="text-gray-600">운영자 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
