import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchProductsByStore } from '../requests/productRequests';
import type { ProductFilters } from '../types/product';

export function useProductsByStoreQuery(
  storeId: string | undefined,
  filters: ProductFilters = {},
) {
  return useQuery({
    queryKey: storeId
      ? queryKeys.productsByStore(storeId, filters as Record<string, unknown>)
      : ['products', 'store', 'none'],
    queryFn: () => fetchProductsByStore(storeId!, filters),
    enabled: Boolean(storeId),
  });
}
