import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addCartItem,
  removeCartItem,
  updateCartItem,
} from '../requests/cartRequests';
import { useAuth } from './useAuth';
import { queryKeys } from '../helpers/queryKeys';
import type { Cart } from '../types/cart';
import type { AddToCartPayload } from '../validations/addToCartSchema';
import type { UpdateCartItemPayload } from '../validations/updateCartItemSchema';

export function useCartMutations() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const syncCartCache = (cart: Cart) => {
    queryClient.setQueryData(queryKeys.cart, cart);
    void queryClient.invalidateQueries({ queryKey: queryKeys.cartSummary });
  };

  const addItem = useMutation({
    mutationFn: (body: AddToCartPayload) =>
      addCartItem({ token }, body),
    onSuccess: syncCartCache,
  });

  const updateItem = useMutation({
    mutationFn: ({
      itemId,
      body,
    }: {
      itemId: string;
      body: UpdateCartItemPayload;
    }) => updateCartItem({ token }, itemId, body),
    onSuccess: syncCartCache,
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => removeCartItem({ token }, itemId),
    onSuccess: syncCartCache,
  });

  return { addItem, updateItem, removeItem };
}
