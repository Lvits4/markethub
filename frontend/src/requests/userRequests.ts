import { apiPaths } from '../config/apiPaths';
import type { UserProfile } from '../types/userProfile';
import { fetchDefault } from './fetchDefault';

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  avatar?: string;
};

export function fetchUserProfile(token: string) {
  return fetchDefault<UserProfile>(apiPaths.usersProfile, { token });
}

export function patchUserProfile(token: string, body: UpdateProfilePayload) {
  return fetchDefault<UserProfile>(apiPaths.usersProfile, {
    token,
    method: 'PATCH',
    body,
  });
}
