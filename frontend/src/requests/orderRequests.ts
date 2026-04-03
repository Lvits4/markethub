import { apiPaths } from '../config/apiPaths';
import type { Order } from '../types/order';
import { fetchDefault } from './fetchDefault';

export async function createOrderFromCart(
  token: string,
  shippingAddress: string,
): Promise<Order[]> {
  return fetchDefault<Order[]>(apiPaths.orders, {
    token,
    method: 'POST',
    body: { shippingAddress },
  });
}

export async function fetchMyOrders(token: string): Promise<Order[]> {
  return fetchDefault<Order[]>(apiPaths.ordersMy, { token });
}

export async function clearMyOrdersHistory(token: string): Promise<void> {
  await fetchDefault<null>(apiPaths.ordersMy, { token, method: 'DELETE' });
}

export async function fetchOrderById(
  token: string,
  orderId: string,
): Promise<Order> {
  return fetchDefault<Order>(apiPaths.order(orderId), { token });
}

export async function deleteOrder(
  token: string,
  orderId: string,
): Promise<void> {
  await fetchDefault<null>(apiPaths.order(orderId), {
    token,
    method: 'DELETE',
  });
}

export async function fetchStoreOrders(token: string): Promise<Order[]> {
  return fetchDefault<Order[]>(apiPaths.ordersStore, { token });
}

export function patchOrderStatus(
  token: string,
  orderId: string,
  status: string,
) {
  return fetchDefault<Order>(apiPaths.orderStatus(orderId), {
    token,
    method: 'PATCH',
    body: { status },
  });
}
