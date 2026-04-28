import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { fetchPaymentByOrderId } from '../../requests/paymentRequests/paymentRequests';

export function usePaymentByOrderQuery(orderId: string | undefined) {
  const { token, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: orderId ? queryKeys.paymentByOrder(orderId) : ['payments', 'none'],
    queryFn: () => fetchPaymentByOrderId(token!, orderId!),
    enabled: Boolean(orderId && token && isAuthenticated),
  });
}
