import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from './useAuth';
import { deleteAdminStore } from '../requests/adminRequests';

export function useAdminDeleteStore() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeId: string) => {
      if (!token) throw new Error('No autenticado');
      return deleteAdminStore(token, storeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStores });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.storesRejected });
    },
  });
}
