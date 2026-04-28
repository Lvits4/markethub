import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { fetchSellerStoreById } from '../../requests/sellerRequests/sellerRequests';
import { useAuth } from '../../hooks/useAuth/useAuth';

export function useSellerStoreDetailQuery(storeId: string | null) {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    Boolean(storeId) &&
    isAuthenticated &&
    Boolean(token) &&
    (user?.role === 'SELLER' || user?.role === 'ADMIN');

  return useQuery({
    queryKey: queryKeys.sellerStore(storeId ?? ''),
    queryFn: () => fetchSellerStoreById(token!, storeId!),
    enabled: enabled && storeId != null,
  });
}
