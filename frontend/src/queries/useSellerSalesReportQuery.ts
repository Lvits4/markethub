import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchSellerSalesReport } from '../requests/sellerRequests';
import { useAuth } from '../hooks/useAuth';

export function useSellerSalesReportQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && user?.role === 'SELLER';

  return useQuery({
    queryKey: queryKeys.sellerSalesReport,
    queryFn: () => fetchSellerSalesReport(token!),
    enabled,
  });
}
