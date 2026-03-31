import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { registerRequest } from '../requests/authRequests';
import { useAuth } from './useAuth';
import type { RegisterApiBody } from '../validations/registerSchema';

export function useRegister() {
  const auth = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: RegisterApiBody) => registerRequest(values),
    onSuccess: (data) => {
      auth.login(data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
  });
}
