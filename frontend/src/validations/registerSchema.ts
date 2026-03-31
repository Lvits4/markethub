import { z } from 'zod';

const roleEnum = z.enum(['CUSTOMER', 'SELLER']);

export const registerSchema = z.object({
  email: z.string().email('Correo no válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  role: roleEnum.optional(),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
