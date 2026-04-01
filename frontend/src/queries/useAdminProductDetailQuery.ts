import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from '../hooks/useAuth';
import { fetchProductById } from '../requests/productRequests';

export function useAdminProductDetailQuery(productId: string | null) {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    Boolean(productId) &&
    isAuthenticated &&
    Boolean(token) &&
    user?.role === 'ADMIN';

  return useQuery({
    queryKey: queryKeys.product(productId ?? ''),
    queryFn: () => fetchProductById(productId!),
    enabled: enabled && productId != null,
  });
}
