import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from '../hooks/useAuth';
import { fetchRejectedStores } from '../requests/adminRequests';

export function useRejectedStoresQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && user?.role === 'ADMIN';

  return useQuery({
    queryKey: queryKeys.storesRejected,
    queryFn: () => fetchRejectedStores(token!),
    enabled,
  });
}
