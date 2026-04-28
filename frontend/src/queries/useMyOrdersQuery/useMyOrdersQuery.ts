import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { fetchMyOrders } from '../../requests/orderRequests/orderRequests';

export function useMyOrdersQuery() {
  const { token, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.ordersMy,
    queryFn: () => fetchMyOrders(token!),
    enabled: isAuthenticated && Boolean(token),
  });
}
