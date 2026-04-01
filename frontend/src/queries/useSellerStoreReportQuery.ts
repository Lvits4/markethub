import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchSellerOrdersStoreReport } from '../requests/sellerRequests';
import { useAuth } from '../hooks/useAuth';

export function useSellerStoreReportQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && user?.role === 'SELLER';

  return useQuery({
    queryKey: queryKeys.sellerStoreReport,
    queryFn: () => fetchSellerOrdersStoreReport(token!),
    enabled,
  });
}
