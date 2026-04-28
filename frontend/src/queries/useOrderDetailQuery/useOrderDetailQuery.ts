import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { fetchOrderById } from '../../requests/orderRequests/orderRequests';

export function useOrderDetailQuery(orderId: string | undefined) {
  const { token, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: orderId ? queryKeys.order(orderId) : ['orders', 'none'],
    queryFn: () => fetchOrderById(token!, orderId!),
    enabled: Boolean(orderId && token && isAuthenticated),
  });
}
