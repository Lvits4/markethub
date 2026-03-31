import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from '../hooks/useAuth';
import { fetchMyStores } from '../requests/storeRequests';

export function useMyStoresQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const sellerOrAdmin =
    user?.role === 'SELLER' || user?.role === 'ADMIN';

  return useQuery({
    queryKey: queryKeys.myStores,
    queryFn: () => fetchMyStores({ token }),
    enabled: isAuthenticated && Boolean(token) && sellerOrAdmin,
  });
}
