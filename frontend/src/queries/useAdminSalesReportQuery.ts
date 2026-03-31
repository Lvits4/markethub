import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from '../hooks/useAuth';
import { fetchAdminSalesReport } from '../requests/adminRequests';

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
