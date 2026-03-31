import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { toggleAdminUserActive } from '../requests/adminRequests';
import { useAuth } from './useAuth';

export function useAdminToggleUserActive() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      toggleAdminUserActive(token!, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
    },
  });
}
