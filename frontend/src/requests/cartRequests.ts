import { apiPaths } from '../config/apiPaths';
import type { Cart, CartSummary } from '../types/cart';
import { fetchDefault, type FetchDefaultAuth } from './fetchDefault';
import type { AddToCartPayload } from '../validations/addToCartSchema';
import type { UpdateCartItemPayload } from '../validations/updateCartItemSchema';

export async function fetchCart(auth: FetchDefaultAuth): Promise<Cart> {
  return fetchDefault<Cart>(apiPaths.cart, { token: auth.token });
}

export async function fetchCartSummary(
  auth: FetchDefaultAuth,
): Promise<CartSummary> {
  return fetchDefault<CartSummary>(apiPaths.cartSummary, { token: auth.token });
}

export async function addCartItem(
  auth: FetchDefaultAuth,
  body: AddToCartPayload,
): Promise<Cart> {
  return fetchDefault<Cart>(apiPaths.cartItems, {
    method: 'POST',
    token: auth.token,
    body,
  });
}

export async function updateCartItem(
  auth: FetchDefaultAuth,
  itemId: string,
  body: UpdateCartItemPayload,
): Promise<Cart> {
  return fetchDefault<Cart>(apiPaths.cartItem(itemId), {
    method: 'PATCH',
    token: auth.token,
    body,
  });
}

export async function removeCartItem(
  auth: FetchDefaultAuth,
  itemId: string,
): Promise<Cart> {
  return fetchDefault<Cart>(apiPaths.cartItem(itemId), {
    method: 'DELETE',
    token: auth.token,
  });
}

export async function clearCart(auth: FetchDefaultAuth): Promise<void> {
  return fetchDefault<void>(apiPaths.cart, {
    method: 'DELETE',
    token: auth.token,
  });
}
