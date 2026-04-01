import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchSellerStoreById } from '../requests/sellerRequests';
import { useAuth } from '../hooks/useAuth';

export function useSellerStoreDetailQuery(storeId: string | null) {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    Boolean(storeId) &&
    isAuthenticated &&
    Boolean(token) &&
    user?.role === 'SELLER';

  return useQuery({
    queryKey: queryKeys.sellerStore(storeId ?? ''),
    queryFn: () => fetchSellerStoreById(token!, storeId!),
    enabled: enabled && storeId != null,
  });
}
