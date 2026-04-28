import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { checkFavorite } from '../../requests/favoritesRequests/favoritesRequests';
import { useAuth } from '../../hooks/useAuth/useAuth';

export function useFavoriteCheckQuery(
  productId: string | undefined,
  enabledOverride = true,
) {
  const { token, isAuthenticated } = useAuth();
  const enabled = Boolean(
    productId && isAuthenticated && token && enabledOverride,
  );

  return useQuery({
    queryKey: queryKeys.favoriteCheck(productId ?? ''),
    queryFn: () => checkFavorite({ token }, productId!),
    enabled,
  });
}
