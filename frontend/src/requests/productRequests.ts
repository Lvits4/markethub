import { apiPaths } from '../config/apiPaths';
import type { PaginatedProducts, Product, ProductFilters } from '../types/product';
import { fetchDefault, type FetchDefaultAuth } from './fetchDefault';

function toQuery(filters: ProductFilters): string {
  const p = new URLSearchParams();
  if (filters.page != null) p.set('page', String(filters.page));
  if (filters.limit != null) p.set('limit', String(filters.limit));
  if (filters.search) p.set('search', filters.search);
  if (filters.categoryId) p.set('categoryId', filters.categoryId);
  if (filters.storeId) p.set('storeId', filters.storeId);
  if (filters.minPrice != null) p.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice != null) p.set('maxPrice', String(filters.maxPrice));
  if (filters.sortBy) p.set('sortBy', filters.sortBy);
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchProducts(
  filters: ProductFilters = {},
): Promise<PaginatedProducts> {
  const q = toQuery(filters);
  return fetchDefault<PaginatedProducts>(`${apiPaths.products}${q}`);
}

export async function fetchProductById(id: string): Promise<Product> {
  return fetchDefault<Product>(apiPaths.product(id));
}

export async function fetchProductsByStore(
  storeId: string,
  filters: ProductFilters = {},
): Promise<PaginatedProducts> {
  const q = toQuery(filters);
  return fetchDefault<PaginatedProducts>(
    `${apiPaths.productsByStore(storeId)}${q}`,
  );
}

export type ProductImagePayload = {
  url: string;
  altText?: string;
  sortOrder?: number;
};

export type CreateProductPayload = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  storeId?: string;
  categoryId?: string;
  images?: ProductImagePayload[];
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

export async function createProduct(
  auth: FetchDefaultAuth,
  body: CreateProductPayload,
): Promise<Product> {
  return fetchDefault<Product>(apiPaths.products, {
    token: auth.token,
    method: 'POST',
    body,
  });
}

export async function updateProduct(
  auth: FetchDefaultAuth,
  id: string,
  body: UpdateProductPayload,
): Promise<Product> {
  return fetchDefault<Product>(apiPaths.product(id), {
    token: auth.token,
    method: 'PATCH',
    body,
  });
}

export async function deleteProduct(
  auth: FetchDefaultAuth,
  id: string,
): Promise<void> {
  return fetchDefault<void>(apiPaths.product(id), {
    token: auth.token,
    method: 'DELETE',
  });
}
