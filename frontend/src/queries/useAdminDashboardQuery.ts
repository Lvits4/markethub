import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchAdminDashboard } from '../requests/adminRequests';
import { useAuth } from '../hooks/useAuth';

export function useAdminDashboardQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && user?.role === 'ADMIN';

  return useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: () => fetchAdminDashboard(token!),
    enabled,
  });
}
