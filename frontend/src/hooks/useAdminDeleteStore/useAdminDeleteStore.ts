import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { useAuth } from '../useAuth/useAuth';
import { deleteAdminStore } from '../../requests/adminRequests/adminRequests';

export function useAdminDeleteStore() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeId: string) => {
      if (!token) throw new Error('No autenticado');
      return deleteAdminStore(token, storeId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminStores });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminProducts });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.storesRejected });
      void queryClient.invalidateQueries({ queryKey: queryKeys.myStores });
      void queryClient.invalidateQueries({ queryKey: queryKeys.sellerDashboard() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.sellerProducts });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products() });
    },
  });
}
