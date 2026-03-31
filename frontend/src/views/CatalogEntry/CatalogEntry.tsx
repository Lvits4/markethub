import { Navigate } from 'react-router-dom';
import { routePaths } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';
import { CatalogPage } from '../CatalogPage/CatalogPage';

export function CatalogEntry() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user?.role === 'ADMIN') {
    return <Navigate to={routePaths.admin} replace />;
  }

  return <CatalogPage />;
}
