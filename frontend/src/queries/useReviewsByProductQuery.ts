import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchReviewsByProduct } from '../requests/reviewRequests';

export function useReviewsByProductQuery(productId: string | undefined) {
  return useQuery({
    queryKey: productId
      ? queryKeys.reviewsProduct(productId)
      : ['reviews', 'none'],
    queryFn: () => fetchReviewsByProduct(productId!),
    enabled: Boolean(productId),
  });
}
