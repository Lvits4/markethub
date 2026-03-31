import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().uuid('ID de producto no válido'),
  quantity: z.coerce.number().int().min(1, 'Mínimo 1'),
});

export type AddToCartPayload = z.infer<typeof addToCartSchema>;
