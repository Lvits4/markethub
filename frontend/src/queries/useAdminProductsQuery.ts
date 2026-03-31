import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from '../hooks/useAuth';
import { fetchAdminProducts } from '../requests/adminRequests';

export function useAdminProductsQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && user?.role === 'ADMIN';

  return useQuery({
    queryKey: queryKeys.adminProducts,
    queryFn: () => fetchAdminProducts(token!),
    enabled,
  });
}
