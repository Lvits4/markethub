import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { fetchPublicStores } from '../../requests/storeRequests/storeRequests';

export function usePublicStoresQuery() {
  return useQuery({
    queryKey: queryKeys.publicStores,
    queryFn: fetchPublicStores,
  });
}
