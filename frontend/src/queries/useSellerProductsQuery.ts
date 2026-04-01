import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchSellerProducts } from '../requests/sellerRequests';
import { useAuth } from '../hooks/useAuth';

export function useSellerProductsQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && user?.role === 'SELLER';

  return useQuery({
    queryKey: queryKeys.sellerProducts,
    queryFn: () => fetchSellerProducts(token!),
    enabled,
  });
}
