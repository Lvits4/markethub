import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { fetchSellerSalesReport } from '../../requests/sellerRequests/sellerRequests';
import { useAuth } from '../../hooks/useAuth/useAuth';

export function useSellerSalesReportQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && (user?.role === 'SELLER' || user?.role === 'ADMIN');

  return useQuery({
    queryKey: queryKeys.sellerSalesReport,
    queryFn: () => fetchSellerSalesReport(token!),
    enabled,
  });
}
