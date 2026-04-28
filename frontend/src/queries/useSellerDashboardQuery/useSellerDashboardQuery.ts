import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { fetchSellerDashboard } from '../../requests/sellerRequests/sellerRequests';
import { useAuth } from '../../hooks/useAuth/useAuth';

export function useSellerDashboardQuery(lowStockThreshold?: number) {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && (user?.role === 'SELLER' || user?.role === 'ADMIN');

  return useQuery({
    queryKey: queryKeys.sellerDashboard(lowStockThreshold),
    queryFn: () => fetchSellerDashboard(token!, lowStockThreshold),
    enabled,
  });
}
