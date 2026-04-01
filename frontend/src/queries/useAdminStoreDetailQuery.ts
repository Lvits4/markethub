import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from '../hooks/useAuth';
import { fetchAdminStoreById } from '../requests/adminRequests';

export function useAdminStoreDetailQuery(storeId: string | null) {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    Boolean(storeId) &&
    isAuthenticated &&
    Boolean(token) &&
    user?.role === 'ADMIN';

  return useQuery({
    queryKey: queryKeys.adminStore(storeId ?? ''),
    queryFn: () => fetchAdminStoreById(token!, storeId!),
    enabled: enabled && storeId != null,
  });
}
