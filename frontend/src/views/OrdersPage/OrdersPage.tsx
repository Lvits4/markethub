import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
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
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:pb-10 sm:pt-8 lg:pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Mis pedidos
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Historial de compras realizadas desde tu cuenta.
          </p>
        </div>
        {data && data.length > 0 ? (
          <button
            type="button"
            onClick={() => setClearHistoryModalOpen(true)}
            className="shrink-0 self-start rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-night-600 dark:bg-night-900 dark:text-zinc-200 dark:hover:bg-night-800"
          >
            Limpiar historial
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <p className="mt-10 text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="mt-10 text-center text-sm text-red-600">
          No se pudieron cargar los pedidos.
        </p>
      ) : !data?.length ? (
        <p className="mt-10 text-center text-sm text-zinc-500">
          Aún no tienes pedidos.{' '}
          <Link
            to={routePaths.catalog}
            className="font-semibold text-[var(--color-forest)]"
          >
            Ir al catálogo
          </Link>
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {data.map((o) => (
            <li key={o.id}>
              <div className="flex gap-2 sm:gap-3">
                <Link
                  to={routePaths.orderDetail(o.id)}
                  className="min-w-0 flex-1 rounded-md bg-white p-5 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 transition hover:ring-zinc-300 dark:bg-night-900 dark:ring-night-800 dark:hover:ring-night-700"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">
                        {o.store?.name ?? 'Tienda'}
                      </p>
                      <p className="mt-2 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                        {formatPrice(numAmount(o.totalAmount))}
                      </p>
                    </div>
                    <span className="rounded-md bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-night-800 dark:text-zinc-300">
                      {formatOrderStatus(o.status)}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => onDeleteOne(o.id)}
                  disabled={deleteOrder.isPending}
                  className="shrink-0 self-stretch rounded-md border border-red-200 bg-white px-3 py-2 text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900/50 dark:bg-night-900 dark:text-red-400 dark:hover:bg-red-950/40 sm:self-auto sm:px-4"
                  aria-label="Eliminar pedido"
                >
                  <FiTrash2 className="mx-auto h-5 w-5" aria-hidden />
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
            className="h-10 min-w-[9rem] justify-center border border-zinc-300 bg-white px-4 text-sm text-zinc-800 hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700"
            onClick={closeClearHistoryModal}
            disabled={clearHistory.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            className="h-10 min-w-[9rem] justify-center"
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
