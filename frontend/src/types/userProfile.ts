import type { Role } from './role';

/** Respuesta de GET /users/profile (usuario serializado) */
export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar: string | null;
  isActive: boolean;
};
