import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { fetchProductsByStore } from '../../requests/productRequests/productRequests';
import type { ProductFilters } from '../../types/product/product';

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
    placeholderData: keepPreviousData,
  });
}
