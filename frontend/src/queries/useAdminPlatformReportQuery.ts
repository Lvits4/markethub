import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from '../hooks/useAuth';
import { fetchOrdersStoreReport } from '../requests/adminRequests';

export function useAdminPlatformReportQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && user?.role === 'ADMIN';

  return useQuery({
    queryKey: queryKeys.adminPlatformReport,
    queryFn: () => fetchOrdersStoreReport(token!),
    enabled,
  });
}
