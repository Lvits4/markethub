import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import {
  updateAdminUser,
  type AdminUpdateUserPayload,
} from '../requests/adminRequests';
import { useAuth } from './useAuth';

export function useAdminUpdateUser() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: string;
      body: AdminUpdateUserPayload;
    }) => {
      if (!token) throw new Error('No autenticado');
      return updateAdminUser(token, userId, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    },
  });
}
