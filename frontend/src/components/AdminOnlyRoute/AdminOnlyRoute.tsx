import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { routePaths } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';

type AdminOnlyRouteProps = {
  children: ReactNode;
};

export function AdminOnlyRoute({ children }: AdminOnlyRouteProps) {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <Navigate to={routePaths.admin} replace />;
  }

  return <>{children}</>;
}
