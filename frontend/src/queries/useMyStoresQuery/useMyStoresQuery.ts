import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { fetchMyStores } from '../../requests/storeRequests/storeRequests';

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
