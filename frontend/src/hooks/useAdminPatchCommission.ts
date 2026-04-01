import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from './useAuth';
import { patchAdminStoreCommission } from '../requests/adminRequests';

export function useAdminPatchCommission() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      commission,
    }: {
      storeId: string;
      commission: number;
    }) => {
      if (!token) throw new Error('No autenticado');
      return patchAdminStoreCommission(token, storeId, commission);
    },
    onSuccess: (_data, { storeId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminStores });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminStore(storeId),
      });
    },
  });
}
