import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { fetchProductById } from '../../requests/productRequests/productRequests';

export function useAdminProductDetailQuery(productId: string | null) {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    Boolean(productId) &&
    isAuthenticated &&
    Boolean(token) &&
    (user?.role === 'ADMIN' || user?.role === 'SELLER');

  return useQuery({
    queryKey: queryKeys.product(productId ?? ''),
    queryFn: () => fetchProductById(productId!),
    enabled: enabled && productId != null,
  });
}
