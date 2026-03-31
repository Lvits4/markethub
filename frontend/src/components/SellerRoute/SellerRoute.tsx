import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { routePaths } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';

type SellerRouteProps = {
  children: ReactNode;
};

export function SellerRoute({ children }: SellerRouteProps) {
  const { user } = useAuth();

  if (user?.role !== 'SELLER' && user?.role !== 'ADMIN') {
    return <Navigate to={routePaths.catalog} replace />;
  }

  return <>{children}</>;
}
