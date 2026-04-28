import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { fetchCategoriesFlat } from '../../requests/categoryRequests/categoryRequests';

export function useCategoriesFlatQuery() {
  return useQuery({
    queryKey: queryKeys.categoriesFlat,
    queryFn: fetchCategoriesFlat,
    staleTime: 60_000,
  });
}
