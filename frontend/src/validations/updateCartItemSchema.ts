import { z } from 'zod';

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1, 'Mínimo 1'),
});

export type UpdateCartItemPayload = z.infer<typeof updateCartItemSchema>;
