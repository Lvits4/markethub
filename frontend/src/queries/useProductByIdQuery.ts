import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchProductById } from '../requests/productRequests';

export function useProductByIdQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.product(id ?? ''),
    queryFn: () => fetchProductById(id!),
    enabled: Boolean(id),
  });
}
