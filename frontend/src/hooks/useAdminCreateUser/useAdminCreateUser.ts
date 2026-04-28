import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import {
  createAdminUser,
  type AdminCreateUserPayload,
} from '../../requests/adminRequests/adminRequests';
import { useAuth } from '../useAuth/useAuth';

export function useAdminCreateUser() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AdminCreateUserPayload) => {
      if (!token) throw new Error('No autenticado');
      return createAdminUser(token, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard() });
    },
  });
}
