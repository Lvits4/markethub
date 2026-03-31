import { apiPaths } from '../config/apiPaths';
import type { PaymentRow } from '../types/payment';
import { fetchDefault } from './fetchDefault';

export async function fetchPaymentByOrderId(
  token: string,
  orderId: string,
): Promise<PaymentRow | null> {
  return fetchDefault<PaymentRow | null>(
    apiPaths.paymentByOrder(orderId),
    { token },
  );
}
