import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError';
import { formatPrice } from '../../helpers/formatPrice';
import { formatOrderStatus } from '../../helpers/orderStatus';
import { useDeleteOrderMutation } from '../../hooks/useDeleteOrderMutation';
import { useOrderDetailQuery } from '../../queries/useOrderDetailQuery';
import { usePaymentByOrderQuery } from '../../queries/usePaymentByOrderQuery';

function numAmount(v: string | number) {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrderDetailQuery(id);
  const { data: payment } = usePaymentByOrderQuery(id);
  const deleteOrder = useDeleteOrderMutation();

  const onDelete = () => {
    if (!id) return;
    if (
      !window.confirm(
        '¿Eliminar este pedido de forma permanente? No podrás recuperarlo.',
      )
    ) {
      return;
    }
    deleteOrder.mutate(id, {
      onSuccess: () => {
        toast.success('Pedido eliminado');
        void navigate(routePaths.orders);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

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
          className="font-semibold text-forest"
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

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Pedido
        </h1>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleteOrder.isPending}
          className="inline-flex items-center justify-center gap-2 self-start rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900/50 dark:bg-night-900 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          <FiTrash2 className="h-4 w-4" aria-hidden />
          {deleteOrder.isPending ? 'Eliminando…' : 'Eliminar pedido'}
        </button>
      </div>

      <div className="mt-6 rounded-md bg-white p-5 shadow-market ring-1 ring-zinc-200/70 dark:bg-night-900 dark:ring-night-800">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500">Estado</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-50">
              {formatOrderStatus(order.status)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Total</dt>
            <dd className="font-semibold tabular-nums text-forest">
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
        <div className="mt-6 rounded-md bg-white p-5 shadow-market ring-1 ring-zinc-200/70 dark:bg-night-900 dark:ring-night-800">
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
