import type { Product } from './product';

export type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: string | number;
  productId: string;
  orderId?: string;
  product?: Pick<Product, 'id' | 'name' | 'price'>;
};

export type Order = {
  id: string;
  status: string;
  totalAmount: string | number;
  shippingAddress: string | null;
  userId: string;
  storeId: string;
  user?: { id: string; email: string; firstName: string; lastName: string };
  store?: { id: string; name: string; slug?: string };
  items?: OrderItem[];
};
