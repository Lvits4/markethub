import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchCategoriesFlat } from '../requests/categoryRequests';

export function useCategoriesFlatQuery() {
  return useQuery({
    queryKey: queryKeys.categoriesFlat,
    queryFn: fetchCategoriesFlat,
    staleTime: 60_000,
  });
}
