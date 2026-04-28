import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addFavorite, removeFavorite } from '../../requests/favoritesRequests/favoritesRequests';
import { useAuth } from '../useAuth/useAuth';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';

export function useFavoriteToggle(productId: string | undefined) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    if (productId) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.favoriteCheck(productId),
      });
    }
  };

  const add = useMutation({
    mutationFn: () => addFavorite({ token }, productId!),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: () => removeFavorite({ token }, productId!),
    onSuccess: invalidate,
  });

  return { add, remove };
}
