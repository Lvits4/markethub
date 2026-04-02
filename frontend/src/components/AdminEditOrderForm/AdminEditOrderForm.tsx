import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FormSelect } from '../CreateProductForm/FormSelect';
import { Button } from '../Button/Button';
import { getErrorMessage } from '../../helpers/mapApiError';
import {
  isOrderStatusValue,
  orderStatusLabel,
  ORDER_STATUS_VALUES,
  type OrderStatusValue,
} from '../../helpers/orderStatus';
import { useAdminOrderStatus } from '../../hooks/useAdminOrderStatus';
import { formatPrice } from '../../helpers/formatPrice';
import type { Order } from '../../types/order';

const labelClass = 'text-xs font-medium text-zinc-600 dark:text-zinc-300';

const ORDER_STATUS_OPTIONS = ORDER_STATUS_VALUES.map((st) => ({
  value: st,
  label: orderStatusLabel[st],
}));

function numAmount(v: string | number) {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export type AdminEditOrderFormProps = {
  order: Order;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function AdminEditOrderForm({
  order,
  onSuccess,
  onCancel,
}: AdminEditOrderFormProps) {
  const updateStatus = useAdminOrderStatus();

  const [status, setStatus] = useState<OrderStatusValue>(
    isOrderStatusValue(order.status) ? order.status : 'PENDING',
  );

  useEffect(() => {
    setStatus(isOrderStatusValue(order.status) ? order.status : 'PENDING');
  }, [order]);

  const busy = updateStatus.isPending;
  const unchanged =
    status === (isOrderStatusValue(order.status) ? order.status : 'PENDING');

  const handleSave = () => {
    if (unchanged) return;
    updateStatus.mutate(
      { orderId: order.id, status },
      {
        onSuccess: () => {
          toast.success('Estado del pedido actualizado');
          onSuccess?.();
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <div className="market-scroll min-h-0 max-h-[min(60vh,520px)] flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:max-h-[min(65vh,580px)]">
        <div className="mb-4 rounded-md border border-zinc-100 bg-zinc-50/60 p-3 dark:border-night-700 dark:bg-night-900/50">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Pedido{' '}
            <span className="font-mono text-zinc-700 dark:text-zinc-300">
              {order.id.slice(0, 8)}…
            </span>
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {formatPrice(numAmount(order.totalAmount))}
          </p>
          {order.store?.name ? (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Tienda: {order.store.name}
            </p>
          ) : null}
          {order.user?.email ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Cliente: {order.user.email}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="edit-order-status" className={labelClass}>
              Estado del pedido{' '}
              <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <FormSelect
              id="edit-order-status"
              value={status}
              onChange={(v) => {
                if (isOrderStatusValue(v)) setStatus(v);
              }}
              options={ORDER_STATUS_OPTIONS}
              disabled={busy}
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Selecciona el nuevo estado para este pedido.
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col gap-2 border-t border-zinc-100 bg-zinc-50/90 px-5 py-4 dark:border-night-800 dark:bg-night-950/90 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <div className="flex w-full gap-2 sm:w-auto">
          {onCancel ? (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={onCancel}
              className="h-11 min-h-11 min-w-0 flex-1 basis-0 justify-center border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700 sm:flex-none sm:min-w-[7.5rem]"
            >
              Cancelar
            </Button>
          ) : null}
          <Button
            type="button"
            variant="cta"
            disabled={busy || unchanged}
            onClick={handleSave}
            className="h-11 min-h-11 min-w-0 flex-1 justify-center px-3 sm:min-w-[11rem]"
          >
            {busy ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </form>
  );
}
