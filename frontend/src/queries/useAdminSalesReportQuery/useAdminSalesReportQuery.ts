import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { fetchAdminSalesReport } from '../../requests/adminRequests/adminRequests';

export function useAdminSalesReportQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && user?.role === 'ADMIN';

  return useQuery({
    queryKey: queryKeys.adminSalesReport,
    queryFn: () => fetchAdminSalesReport(token!),
    enabled,
  });
}
