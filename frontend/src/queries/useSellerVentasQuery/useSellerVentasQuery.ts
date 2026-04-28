import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { fetchSellerVentas } from '../../requests/sellerRequests/sellerRequests';
import { useAuth } from '../../hooks/useAuth/useAuth';

export function useSellerVentasQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && (user?.role === 'SELLER' || user?.role === 'ADMIN');

  return useQuery({
    queryKey: queryKeys.sellerVentas,
    queryFn: () => fetchSellerVentas(token!),
    enabled,
  });
}
