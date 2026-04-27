import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { Modal } from '../../components/Modal/Modal';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError';
import { formatPrice } from '../../helpers/formatPrice';
import { formatOrderStatus } from '../../helpers/orderStatus';
import { useClearMyOrdersMutation } from '../../hooks/useClearMyOrdersMutation';
import { useDeleteOrderMutation } from '../../hooks/useDeleteOrderMutation';
import { useMyOrdersQuery } from '../../queries/useMyOrdersQuery';

function numAmount(v: string | number) {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

function OrderStatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-semibold text-sky-800 dark:bg-sky-500/20 dark:text-sky-300">
      {label}
    </span>
  );
}

export function OrdersPage() {
  const { data, isLoading, isError } = useMyOrdersQuery();
  const clearHistory = useClearMyOrdersMutation();
  const deleteOrder = useDeleteOrderMutation();
  const [clearHistoryModalOpen, setClearHistoryModalOpen] = useState(false);

  const closeClearHistoryModal = () => {
    if (!clearHistory.isPending) setClearHistoryModalOpen(false);
  };

  const onConfirmClearHistory = () => {
    clearHistory.mutate(undefined, {
      onSuccess: () => {
        setClearHistoryModalOpen(false);
        toast.success('Historial de pedidos limpiado');
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  const onDeleteOne = (orderId: string) => {
    if (
      !window.confirm(
        '¿Eliminar este pedido de forma permanente? No podrás recuperarlo.',
      )
    ) {
      return;
    }
    deleteOrder.mutate(orderId, {
      onSuccess: () => toast.success('Pedido eliminado'),
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:pb-10 sm:pt-6 lg:px-6 lg:pb-12">
      <nav
        className="mb-3 flex flex-wrap items-center gap-2 text-sm"
        aria-label="Navegación"
      >
        <Link
          to={routePaths.catalog}
          className="inline-flex items-center gap-1.5 rounded-md py-1.5 pl-1 pr-2 text-sm font-medium text-zinc-700 transition hover:text-sky-600 dark:text-zinc-300 dark:hover:text-sky-400"
        >
          <FiArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Atrás
        </Link>
        <span aria-hidden className="text-zinc-300 dark:text-zinc-600">
          /
        </span>
        <span className="line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
          Mis pedidos
        </span>
      </nav>

      <div className="flex w-full flex-col gap-4 lg:gap-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              Mis pedidos
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              Historial de compras realizadas desde tu cuenta.
            </p>
          </div>
          {data && data.length > 0 ? (
            <button
              type="button"
              onClick={() => setClearHistoryModalOpen(true)}
              className="inline-flex shrink-0 items-center justify-center rounded-md border border-sky-300/70 bg-white px-3 py-2 text-sm font-medium text-sky-800 shadow-sm transition hover:bg-sky-500/10 dark:border-sky-500/35 dark:bg-night-900 dark:text-sky-300 dark:hover:bg-sky-500/15"
            >
              Limpiar historial
            </button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <p className="mt-6 text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="mt-6 text-center text-sm text-red-600">
          No se pudieron cargar los pedidos.
        </p>
      ) : !data?.length ? (
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Aún no tienes pedidos.{' '}
          <Link
            to={routePaths.catalog}
            className="font-semibold text-sky-600 dark:text-sky-400"
          >
            Ir al catálogo
          </Link>
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3 sm:gap-4">
          {data.map((o) => (
            <li key={o.id}>
              <div className="flex flex-col gap-3 rounded-xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm ring-1 ring-zinc-200/40 transition-[box-shadow,border-color,background-color] duration-200 hover:border-sky-400/55 hover:bg-sky-500/4 hover:shadow-md dark:border-night-700 dark:bg-night-900/90 dark:ring-night-800/80 dark:hover:border-sky-500/45 dark:hover:bg-sky-500/10 sm:flex-row sm:items-stretch sm:gap-3 sm:p-4">
                <Link
                  to={routePaths.orderDetail(o.id)}
                  aria-label={`Ver detalle del pedido · ${o.store?.name ?? 'tienda'}`}
                  className="group flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg px-2 py-1 outline-offset-2 transition active:scale-[0.995] focus-visible:outline-2 focus-visible:outline-sky-500 sm:px-3 sm:py-2"
                >
                  <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-3 sm:items-center">
                    <div className="min-w-0">
                      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Tienda
                      </span>
                      <p className="mt-0.5 text-sm font-medium text-sky-700 underline decoration-transparent underline-offset-2 transition group-hover:decoration-sky-500/70 dark:text-sky-400">
                        {o.store?.name ?? 'Tienda'}
                      </p>
                      <p className="mt-2 text-xl font-bold tabular-nums text-sky-600 transition group-hover:text-sky-700 dark:text-sky-400 dark:group-hover:text-sky-300 sm:text-2xl">
                        {formatPrice(numAmount(o.totalAmount))}
                      </p>
                      <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                        Ver detalle
                      </p>
                    </div>
                    <OrderStatusBadge label={formatOrderStatus(o.status)} />
                  </div>
                  <FiChevronRight
                    className="h-5 w-5 shrink-0 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-sky-500 dark:text-zinc-500 dark:group-hover:text-sky-400"
                    aria-hidden
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => onDeleteOne(o.id)}
                  disabled={deleteOrder.isPending}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-md text-red-600 transition hover:bg-red-500/10 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/15"
                  aria-label="Eliminar pedido"
                >
                  <FiTrash2 className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={clearHistoryModalOpen}
        onClose={closeClearHistoryModal}
        title="Limpiar historial"
      >
        <div className="space-y-4 px-5 py-4">
          <p className="text-sm text-zinc-700 dark:text-zinc-200">
            ¿Limpiar tu historial de pedidos? Dejarán de mostrarse en tu cuenta
            (las tiendas conservan el registro).
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50/90 px-5 py-4 dark:border-night-800 dark:bg-night-950/90">
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-44 shrink-0 justify-center border border-zinc-300 bg-white px-4 text-sm text-zinc-800 hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700"
            onClick={closeClearHistoryModal}
            disabled={clearHistory.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            className="h-10 w-44 shrink-0 justify-center"
            onClick={onConfirmClearHistory}
            disabled={clearHistory.isPending}
          >
            {clearHistory.isPending ? 'Eliminando…' : 'Sí, limpiar'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
