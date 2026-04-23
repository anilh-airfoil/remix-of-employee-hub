import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type AppRole = 'owner' | 'admin' | 'member';

interface RoleGuardProps {
  children: React.ReactNode;
  /** Roles allowed to access this route */
  allowedRoles: AppRole[];
  /** Where to redirect unauthorized users (default: /profile) */
  fallback?: string;
}

/**
 * Wraps a route to enforce role-based access.
 * Must be used inside ProtectedRoute (which handles auth check).
 */
export default function RoleGuard({
  children,
  allowedRoles,
  fallback = '/profile',
}: RoleGuardProps) {
  const { role, loading } = useAuth();

  if (loading || role === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
