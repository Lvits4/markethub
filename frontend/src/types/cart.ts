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

export type CartSummaryStoreGroup = {
  storeId: string;
  storeName: string;
  items: Array<{
    id: string;
    quantity: number;
    total: number;
    product: Product;
  }>;
  subtotal: number;
};

export type CartSummary = {
  stores: CartSummaryStoreGroup[];
  totalItems: number;
  globalTotal: number;
};
