import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { fetchAdminEarningsReport } from '../../requests/adminRequests/adminRequests';
import { useAuth } from '../../hooks/useAuth/useAuth';

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
