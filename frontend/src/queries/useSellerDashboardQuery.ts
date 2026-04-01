import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchSellerDashboard } from '../requests/sellerRequests';
import { useAuth } from '../hooks/useAuth';

export function useSellerDashboardQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && user?.role === 'SELLER';

  return useQuery({
    queryKey: queryKeys.sellerDashboard,
    queryFn: () => fetchSellerDashboard(token!),
    enabled,
  });
}
