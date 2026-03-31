import type { Product } from './product';

export type CartItem = {
  id: string;
  quantity: number;
  productId: string;
  cartId: string;
  product?: Product;
};

export type Cart = {
  id: string;
  items: CartItem[];
};
