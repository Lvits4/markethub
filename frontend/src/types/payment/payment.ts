export type PaymentRow = {
  id: string;
  amount: string | number;
  method: string;
  status: string;
  transactionId: string | null;
  orderId: string;
};
