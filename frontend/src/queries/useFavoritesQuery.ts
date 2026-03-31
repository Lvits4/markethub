import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchFavorites } from '../requests/favoritesRequests';
import { useAuth } from '../hooks/useAuth';

export function useFavoritesQuery(enabledOverride = true) {
  const { token, isAuthenticated } = useAuth();
  const enabled = Boolean(isAuthenticated && token && enabledOverride);

  return useQuery({
    queryKey: queryKeys.favorites,
    queryFn: () => fetchFavorites({ token }),
    enabled,
  });
}
