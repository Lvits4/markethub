import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addCartItem,
  removeCartItem,
  updateCartItem,
} from '../requests/cartRequests';
import { useAuth } from './useAuth';
import { queryKeys } from '../helpers/queryKeys';
import type { AddToCartPayload } from '../validations/addToCartSchema';
import type { UpdateCartItemPayload } from '../validations/updateCartItemSchema';

export function useCartMutations() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: queryKeys.cart });

  const addItem = useMutation({
    mutationFn: (body: AddToCartPayload) =>
      addCartItem({ token }, body),
    onSuccess: invalidate,
  });

  const updateItem = useMutation({
    mutationFn: ({
      itemId,
      body,
    }: {
      itemId: string;
      body: UpdateCartItemPayload;
    }) => updateCartItem({ token }, itemId, body),
    onSuccess: invalidate,
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => removeCartItem({ token }, itemId),
    onSuccess: invalidate,
  });

  return { addItem, updateItem, removeItem };
}
