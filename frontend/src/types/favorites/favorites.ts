import type { Product } from '../product/product';

export type FavoriteWithProduct = {
  id: string;
  userId: string;
  productId: string;
  product: Product;
};
