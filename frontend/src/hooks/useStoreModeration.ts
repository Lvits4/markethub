import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from './useAuth';
import { approveStore, rejectStore } from '../requests/adminRequests';

export function useStoreApprove() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeId: string) => {
      if (!token) throw new Error('No autenticado');
      return approveStore(token, storeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.storesRejected });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStores });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    },
  });
}

export function useStoreReject() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeId: string) => {
      if (!token) throw new Error('No autenticado');
      return rejectStore(token, storeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.storesRejected });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStores });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    },
  });
}
