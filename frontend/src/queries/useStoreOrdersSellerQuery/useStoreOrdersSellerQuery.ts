import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { fetchStoreOrders } from '../../requests/orderRequests/orderRequests';

export function useStoreOrdersSellerQuery() {
  const { token, isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: queryKeys.ordersStore,
    queryFn: () => fetchStoreOrders(token!),
    enabled:
      isAuthenticated && Boolean(token) && (user?.role === 'SELLER' || user?.role === 'ADMIN'),
  });
}
