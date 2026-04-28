import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { fetchAdminOrders } from '../../requests/adminRequests/adminRequests';

export function useAdminOrdersQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && user?.role === 'ADMIN';

  return useQuery({
    queryKey: queryKeys.adminOrders,
    queryFn: () => fetchAdminOrders(token!),
    enabled,
  });
}
