import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from '../hooks/useAuth';
import { fetchAdminOrders } from '../requests/adminRequests';

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
