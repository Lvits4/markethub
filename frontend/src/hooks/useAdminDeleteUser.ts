import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { deleteAdminUser } from '../requests/adminRequests';
import { useAuth } from './useAuth';

export function useAdminDeleteUser() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => {
      if (!token) throw new Error('No autenticado');
      return deleteAdminUser(token, userId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminStores });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminProducts });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders });
      void queryClient.invalidateQueries({ queryKey: queryKeys.storesRejected });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminSalesReport });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminPlatformReport });
    },
  });
}
