import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchStoreByLookupTerm } from '../requests/storeRequests';

export function useStorePublicQuery(term: string | undefined) {
  const t = term?.trim();
  return useQuery({
    queryKey: queryKeys.storePublicLookup(t ?? ''),
    queryFn: () => fetchStoreByLookupTerm(t!),
    enabled: Boolean(t),
  });
}
