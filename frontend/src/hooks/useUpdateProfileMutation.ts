import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from './useAuth';
import {
  patchUserProfile,
  type UpdateProfilePayload,
} from '../requests/userRequests';
import type { AuthUser } from '../types/user';

function profileToAuthUser(p: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AuthUser['role'];
}): AuthUser {
  return {
    id: p.id,
    email: p.email,
    firstName: p.firstName,
    lastName: p.lastName,
    role: p.role,
  };
}

export function useUpdateProfileMutation() {
  const { token, setUser } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateProfilePayload) => {
      if (!token) throw new Error('No autenticado');
      return patchUserProfile(token, body);
    },
    onSuccess: (profile) => {
      setUser(profileToAuthUser(profile));
      void qc.invalidateQueries({ queryKey: queryKeys.userProfile });
    },
  });
}
