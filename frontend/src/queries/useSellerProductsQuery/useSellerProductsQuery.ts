import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { fetchSellerProducts } from '../../requests/sellerRequests/sellerRequests';
import { useAuth } from '../../hooks/useAuth/useAuth';

export function useSellerProductsQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && (user?.role === 'SELLER' || user?.role === 'ADMIN');

  return useQuery({
    queryKey: queryKeys.sellerProducts,
    queryFn: () => fetchSellerProducts(token!),
    enabled,
  });
}
