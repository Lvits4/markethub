import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchSellerVentas } from '../requests/sellerRequests';
import { useAuth } from '../hooks/useAuth';

export function useSellerVentasQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && user?.role === 'SELLER';

  return useQuery({
    queryKey: queryKeys.sellerVentas,
    queryFn: () => fetchSellerVentas(token!),
    enabled,
  });
}
