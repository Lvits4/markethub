import { apiPaths } from '../config/apiPaths';
import type { LoginFormValues } from '../validations/loginSchema';
import type { RegisterApiBody } from '../validations/registerSchema';
import { fetchDefault } from './fetchDefault';
import type { LoginResult } from '../types/user';

export async function loginRequest(body: LoginFormValues): Promise<LoginResult> {
  const payload = { email: body.email, password: body.password };
  return fetchDefault<LoginResult>(apiPaths.login, {
    method: 'POST',
    body: payload,
  });
}

export async function registerRequest(body: RegisterApiBody): Promise<LoginResult> {
  const payload = {
    email: body.email,
    password: body.password,
    name: body.name,
    role: body.role,
  };
  return fetchDefault<LoginResult>(apiPaths.register, {
    method: 'POST',
    body: payload,
  });
}
