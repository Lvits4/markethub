import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { routePaths } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';

type AdminRouteProps = {
  children: ReactNode;
};

export function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <Navigate to={routePaths.catalog} replace />;
  }

  return <>{children}</>;
}
