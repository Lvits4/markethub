import { Navigate } from 'react-router-dom';
import { routePaths } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';
import { CatalogPage } from '../CatalogPage/CatalogPage';

export function CatalogEntry() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={routePaths.login} replace />;
  }

  if (user?.role === 'ADMIN') {
    return <Navigate to={routePaths.admin} replace />;
  }

  if (user?.role === 'SELLER') {
    return <Navigate to={routePaths.seller} replace />;
  }

  return <CatalogPage />;
}
