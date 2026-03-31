import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from '../hooks/useAuth';
import { fetchAdminStores } from '../requests/adminRequests';

export function useAdminStoresQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && user?.role === 'ADMIN';

  return useQuery({
    queryKey: queryKeys.adminStores,
    queryFn: () => fetchAdminStores(token!),
    enabled,
  });
}
