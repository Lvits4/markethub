import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../useAuth/useAuth';
import { clearMyOrdersHistory } from '../../requests/orderRequests/orderRequests';

export function useClearMyOrdersMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearMyOrdersHistory(token!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
