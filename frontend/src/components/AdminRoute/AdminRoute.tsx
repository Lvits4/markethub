import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { routePaths } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth/useAuth';

type AdminRouteProps = {
  children: ReactNode;
};

export function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN' && user?.role !== 'SELLER') {
    return <Navigate to={routePaths.catalog} replace />;
  }

  return <>{children}</>;
}
