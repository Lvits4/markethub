export const ORDER_STATUS_VALUES = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

export type OrderStatusValue = (typeof ORDER_STATUS_VALUES)[number];

export const orderStatusLabel: Record<OrderStatusValue, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export function isOrderStatusValue(v: string): v is OrderStatusValue {
  return (ORDER_STATUS_VALUES as readonly string[]).includes(v);
}

export function formatOrderStatus(status: string): string {
  return isOrderStatusValue(status) ? orderStatusLabel[status] : status;
}
