import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { loginRequest } from '../requests/authRequests';
import { useAuth } from './useAuth';
import type { LoginFormValues } from '../validations/loginSchema';

export function useLogin() {
  const auth = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LoginFormValues) => loginRequest(values),
    onSuccess: (data) => {
      auth.login(data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
  });
}
