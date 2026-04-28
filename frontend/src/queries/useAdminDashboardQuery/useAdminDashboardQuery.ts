import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { fetchAdminDashboard } from '../../requests/adminRequests/adminRequests';
import { useAuth } from '../../hooks/useAuth/useAuth';

export function useAdminDashboardQuery(days?: number) {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && user?.role === 'ADMIN';

  return useQuery({
    queryKey: queryKeys.adminDashboard(days),
    queryFn: () => fetchAdminDashboard(token!, days),
    enabled,
  });
}
