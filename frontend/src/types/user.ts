import type { Role } from './role';

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

export type LoginResult = {
  user: AuthUser;
  accessToken: string;
};
