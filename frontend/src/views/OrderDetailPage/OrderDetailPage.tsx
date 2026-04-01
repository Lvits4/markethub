import { Link, useParams } from 'react-router-dom';
import { routePaths } from '../../config/routes';
import { formatPrice } from '../../helpers/formatPrice';
import { formatOrderStatus } from '../../helpers/orderStatus';
import { useOrderDetailQuery } from '../../queries/useOrderDetailQuery';
import { usePaymentByOrderQuery } from '../../queries/usePaymentByOrderQuery';

function numAmount(v: string | number) {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useOrderDetailQuery(id);
  const { data: payment } = usePaymentByOrderQuery(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-zinc-500">
        Cargando pedido…
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-red-600">
        Pedido no encontrado.{' '}
        <Link
          to={routePaths.orders}
          className="font-semibold text-[var(--color-forest)] dark:text-blue-400"
        >
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:pb-10 sm:pt-8 lg:pb-12">
      <div className="mb-6">
        <Link
          to={routePaths.orders}
          className="inline-flex rounded-md px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-200/60 dark:text-zinc-100 dark:hover:bg-night-800"
        >
          ← Mis pedidos
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Pedido
      </h1>
      <p className="mt-1 font-mono text-xs text-zinc-400">{order.id}</p>

      <div className="mt-6 rounded-md bg-white p-5 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-night-900 dark:ring-night-800">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500">Estado</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-50">
              {formatOrderStatus(order.status)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Total</dt>
            <dd className="font-semibold tabular-nums text-[var(--color-forest)] dark:text-blue-400">
              {formatPrice(numAmount(order.totalAmount))}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-zinc-500">Envío</dt>
            <dd className="text-zinc-800 dark:text-zinc-200">
              {order.shippingAddress ?? '—'}
            </dd>
          </div>
        </dl>
      </div>

      {payment ? (
        <div className="mt-6 rounded-md bg-white p-5 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-night-900 dark:ring-night-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Pago
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Estado: <span className="font-medium">{payment.status}</span>
            {payment.transactionId ? (
              <>
                {' '}
                · Transacción:{' '}
                <span className="font-mono text-xs">{payment.transactionId}</span>
              </>
            ) : null}
          </p>
          <p className="mt-1 text-sm tabular-nums text-zinc-800 dark:text-zinc-200">
            Importe: {formatPrice(numAmount(payment.amount))}
          </p>
        </div>
      ) : null}

      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Artículos
        </h2>
        <ul className="mt-3 space-y-2">
          {(order.items ?? []).map((it) => (
            <li
              key={it.id}
              className="flex flex-wrap justify-between gap-2 rounded-md border border-zinc-100 px-4 py-3 text-sm dark:border-night-800"
            >
              <span>
                {it.quantity}× {it.product?.name ?? 'Producto'}
              </span>
              <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
                {formatPrice(numAmount(it.unitPrice) * it.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
