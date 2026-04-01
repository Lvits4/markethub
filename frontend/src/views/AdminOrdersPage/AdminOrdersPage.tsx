import toast from 'react-hot-toast';
import { formatPrice } from '../../helpers/formatPrice';
import {
  isOrderStatusValue,
  orderStatusLabel,
  ORDER_STATUS_VALUES,
} from '../../helpers/orderStatus';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAdminOrderStatus } from '../../hooks/useAdminOrderStatus';
import { useAdminOrdersQuery } from '../../queries/useAdminOrdersQuery';

function numAmount(v: string | number) {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export function AdminOrdersPage() {
  const { data, isLoading, isError } = useAdminOrdersQuery();
  const updateStatus = useAdminOrderStatus();

  const onStatusChange = (orderId: string, status: string) => {
    if (!isOrderStatusValue(status)) return;
    updateStatus.mutate(
      { orderId, status },
      {
        onSuccess: () => toast.success('Estado del pedido actualizado'),
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  const itemsSummary = (
    items?: { quantity: number; product?: { name: string } }[],
  ) => {
    if (!items?.length) return '—';
    return items
      .map((i) => `${i.quantity}× ${i.product?.name ?? 'Producto'}`)
      .join(', ');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Pedidos
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Listado global (
        <code className="rounded-md bg-zinc-100 px-1 text-xs dark:bg-night-800">
          GET /admin/orders
        </code>
        ), equivalente a lo que el admin obtiene en{' '}
        <code className="rounded-md bg-zinc-100 px-1 text-xs dark:bg-night-800">
          GET /orders/store
        </code>
        . Cambia el estado con{' '}
        <code className="rounded-md bg-zinc-100 px-1 text-xs dark:bg-night-800">
          PATCH /orders/:id/status
        </code>
        .
      </p>

      {isLoading ? (
        <p className="mt-10 text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="mt-10 text-center text-sm text-red-600">
          No se pudieron cargar los pedidos.
        </p>
      ) : !data?.length ? (
        <p className="mt-10 text-center text-sm text-zinc-500">
          No hay pedidos.
        </p>
      ) : (
        <div className="mt-8 space-y-6">
          {data.map((o) => (
            <div
              key={o.id}
              className="rounded-md bg-white p-5 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-night-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-night-800"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-zinc-400">{o.id}</p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      Cliente:
                    </span>{' '}
                    {o.user?.email ?? o.userId}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      Tienda:
                    </span>{' '}
                    {o.store?.name ?? o.storeId}
                  </p>
                  <p className="mt-2 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                    {formatPrice(numAmount(o.totalAmount))}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Estado
                  </label>
                  <select
                    className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-night-700 dark:bg-night-950"
                    value={isOrderStatusValue(o.status) ? o.status : 'PENDING'}
                    disabled={updateStatus.isPending}
                    onChange={(e) => onStatusChange(o.id, e.target.value)}
                    aria-label={`Estado del pedido ${o.id}`}
                  >
                    {ORDER_STATUS_VALUES.map((st) => (
                      <option key={st} value={st}>
                        {orderStatusLabel[st]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {o.shippingAddress ? (
                <p className="mt-3 border-t border-zinc-100 pt-3 text-sm text-zinc-500 dark:border-night-800">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Envío:
                  </span>{' '}
                  {o.shippingAddress}
                </p>
              ) : null}
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  Líneas:
                </span>{' '}
                {itemsSummary(o.items)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
