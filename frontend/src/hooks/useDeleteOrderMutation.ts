import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from './useAuth';
import { deleteOrder } from '../requests/orderRequests';

export function useDeleteOrderMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => {
      if (!token) throw new Error('No autenticado');
      return deleteOrder(token, orderId);
    },
    onSuccess: (_data, orderId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ordersMy });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ordersStore });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminSalesReport });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminPlatformReport });
      void queryClient.invalidateQueries({ queryKey: queryKeys.sellerDashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.sellerSalesReport });
      void queryClient.removeQueries({ queryKey: queryKeys.order(orderId) });
      void queryClient.removeQueries({ queryKey: queryKeys.paymentByOrder(orderId) });
    },
  });
}
