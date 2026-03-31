import { z } from 'zod';

const roleEnum = z.enum(['CUSTOMER', 'SELLER']);

export const registerSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Correo no válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: roleEnum,
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type RegisterApiBody = RegisterFormValues;
