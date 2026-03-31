import type { Product } from './product';

export type FavoriteWithProduct = {
  id: string;
  userId: string;
  productId: string;
  product: Product;
};
