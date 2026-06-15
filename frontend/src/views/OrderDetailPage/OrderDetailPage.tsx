import toast from 'react-hot-toast';
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError/mapApiError';
import { formatPrice } from '../../helpers/formatPrice/formatPrice';
import { formatOrderStatus } from '../../helpers/orderStatus/orderStatus';
import { useDeleteOrderMutation } from '../../hooks/useDeleteOrderMutation/useDeleteOrderMutation';
import { useOrderDetailQuery } from '../../queries/useOrderDetailQuery/useOrderDetailQuery';
import { usePaymentByOrderQuery } from '../../queries/usePaymentByOrderQuery/usePaymentByOrderQuery';

function numAmount(v: string | number) {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

function recipientLabel(order: {
  user?: { firstName: string; lastName: string; email: string };
}): string {
  const u = order.user;
  if (!u) return '—';
  const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
  if (name.length > 0) return name;
  return u.email ?? '—';
}

function formatPaymentStatus(status: string): string {
  const u = status.toUpperCase();
  if (u === 'COMPLETED') return 'Completado';
  if (u === 'PENDING') return 'Pendiente';
  if (u === 'FAILED') return 'Fallido';
  return status;
}

function OrderStatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-semibold text-sky-800 dark:bg-sky-500/20 dark:text-sky-300">
      {label}
    </span>
  );
}

function PaymentStatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-400/25 dark:text-blue-200">
      {label}
    </span>
  );
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
      <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center text-sm text-zinc-500 lg:px-6">
        Cargando pedido…
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center text-sm text-red-600 lg:px-6">
        Pedido no encontrado.{' '}
        <Link
          to={routePaths.orders}
          className="font-semibold text-sky-600 dark:text-sky-400"
        >
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  const items = order.items ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:pb-10 sm:pt-6 lg:px-6 lg:pb-12">
      <nav
        className="mb-3 flex flex-wrap items-center gap-2 text-sm"
        aria-label="Navegación del pedido"
      >
        <Link
          to={routePaths.orders}
          className="inline-flex items-center gap-1.5 rounded-md py-1.5 pl-1 pr-2 text-sm font-medium text-zinc-700 transition hover:text-sky-600 dark:text-zinc-300 dark:hover:text-sky-400"
        >
          <FiArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Atrás
        </Link>
        <span aria-hidden className="text-zinc-300 dark:text-zinc-600">
          /
        </span>
        <span className="line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
          Detalle del pedido
        </span>
      </nav>

      <div className="flex w-full flex-col gap-4 lg:gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold tracking-tight text-page-title dark:text-zinc-50 sm:text-2xl">
                Pedido
              </h1>
              {order.store?.name ? (
                <p className="mt-0.5 text-sm text-sky-700 dark:text-sky-400">
                  Tienda: {order.store.name}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onDelete}
              disabled={deleteOrder.isPending}
              title={deleteOrder.isPending ? 'Eliminando…' : 'Eliminar pedido'}
              aria-label={
                deleteOrder.isPending
                  ? 'Eliminando pedido'
                  : 'Eliminar este pedido'
              }
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-red-200/90 bg-red-50/90 px-2 py-1.5 text-xs font-medium text-red-800 shadow-sm transition hover:border-red-300 hover:bg-red-100 disabled:opacity-60 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm dark:border-red-500/35 dark:bg-red-950/45 dark:text-red-200 dark:hover:border-red-400/55 dark:hover:bg-red-950/75"
            >
              <FiTrash2 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
              <span className="max-sm:sr-only">
                {deleteOrder.isPending ? 'Eliminando…' : 'Eliminar'}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge label={formatOrderStatus(order.status)} />
            {payment ? (
              <PaymentStatusBadge label={formatPaymentStatus(payment.status)} />
            ) : null}
          </div>
        </div>

        <div className="w-full">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Artículos
          </span>
          <ul className="mt-2 space-y-2 text-sm">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-zinc-200/80 pb-2 last:border-0 last:pb-0 dark:border-night-700/80"
              >
                <span className="min-w-0 leading-snug text-zinc-800 dark:text-zinc-200">
                  {it.quantity}× {it.product?.name ?? 'Producto'}
                </span>
                <span className="shrink-0 tabular-nums font-medium text-sky-700 dark:text-sky-400">
                  {formatPrice(numAmount(it.unitPrice) * it.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid w-full gap-5 border-t border-zinc-200/80 pt-4 dark:border-night-700 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:gap-8">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Total del pedido
            </span>
            <p className="mt-2 text-3xl font-bold text-sky-600 dark:text-sky-400 sm:text-4xl">
              {formatPrice(numAmount(order.totalAmount))}
            </p>
          </div>

          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Envío
            </span>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                Destinatario:{' '}
              </span>
              {recipientLabel(order)}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                Dirección:{' '}
              </span>
              {order.shippingAddress ?? '—'}
            </p>
          </div>

          {payment ? (
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Pago
              </span>
              <p className="mt-3 font-mono text-sm leading-snug break-all text-zinc-800 dark:text-zinc-200">
                {payment.transactionId?.trim() || '—'}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
