import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { useAuth } from '../useAuth/useAuth';
import { createOrderFromCart } from '../../requests/orderRequests/orderRequests';

export function useCreateOrderMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: { shippingAddress: string; cartItemId?: string }) => {
      if (!token) throw new Error('No autenticado');
      return createOrderFromCart(token, payload);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.cart });
      void qc.invalidateQueries({ queryKey: queryKeys.cartSummary });
      void qc.invalidateQueries({ queryKey: queryKeys.ordersMy });
      void qc.invalidateQueries({ queryKey: queryKeys.adminDashboard() });
      void qc.invalidateQueries({ queryKey: queryKeys.ordersStore });
    },
  });
}
