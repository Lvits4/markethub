import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchAdminEarningsReport } from '../requests/adminRequests';
import { useAuth } from '../hooks/useAuth';

export function useAdminEarningsReportQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && user?.role === 'ADMIN';

  return useQuery({
    queryKey: queryKeys.adminEarningsReport,
    queryFn: () => fetchAdminEarningsReport(token!),
    enabled,
  });
}
