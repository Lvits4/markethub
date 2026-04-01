import type { Category } from './category';
import type { StoreSummary } from './store';

export type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  productId: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string | number;
  stock: number;
  isActive: boolean;
  storeId: string;
  categoryId: string | null;
  store?: StoreSummary;
  category?: Category | null;
  images?: ProductImage[];
};

export type ProductSortBy =
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'best_selling';

export type ProductFilters = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  storeId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ProductSortBy;
};

export type PaginatedProducts = {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
