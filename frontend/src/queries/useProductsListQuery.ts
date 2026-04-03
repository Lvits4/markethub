import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchProducts } from '../requests/productRequests';
import type { ProductFilters } from '../types/product';

export function useProductsListQuery(filters: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () => fetchProducts(filters),
    placeholderData: keepPreviousData,
  });
}
