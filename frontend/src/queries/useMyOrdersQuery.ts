import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from '../hooks/useAuth';
import { fetchMyOrders } from '../requests/orderRequests';

export function useMyOrdersQuery() {
  const { token, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.ordersMy,
    queryFn: () => fetchMyOrders(token!),
    enabled: isAuthenticated && Boolean(token),
  });
}
