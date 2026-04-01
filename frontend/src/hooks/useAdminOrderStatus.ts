import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from './useAuth';
import { patchOrderStatus } from '../requests/orderRequests';

export function useAdminOrderStatus() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      if (!token) throw new Error('No autenticado');
      return patchOrderStatus(token, orderId, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders });
      queryClient.invalidateQueries({ queryKey: queryKeys.ordersStore });
      queryClient.invalidateQueries({ queryKey: queryKeys.ordersMy });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSalesReport });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPlatformReport });
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerSalesReport });
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerStoreReport });
      queryClient.invalidateQueries({
        queryKey: queryKeys.order(variables.orderId),
      });
    },
  });
}
