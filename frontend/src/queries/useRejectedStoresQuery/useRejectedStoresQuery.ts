import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { fetchRejectedStores } from '../../requests/adminRequests/adminRequests';

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
