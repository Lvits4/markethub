import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from './useAuth';
import { createOrderFromCart } from '../requests/orderRequests';

export function useCreateOrderMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (shippingAddress: string) => {
      if (!token) throw new Error('No autenticado');
      return createOrderFromCart(token, shippingAddress);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.cart });
      void qc.invalidateQueries({ queryKey: queryKeys.cartSummary });
      void qc.invalidateQueries({ queryKey: queryKeys.ordersMy });
      void qc.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      void qc.invalidateQueries({ queryKey: queryKeys.ordersStore });
    },
  });
}
