import { Link } from 'react-router-dom';
import { routePaths } from '../../config/routes';
import { formatPrice } from '../../helpers/formatPrice';
import { formatOrderStatus } from '../../helpers/orderStatus';
import { useMyOrdersQuery } from '../../queries/useMyOrdersQuery';

function numAmount(v: string | number) {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export function OrdersPage() {
  const { data, isLoading, isError } = useMyOrdersQuery();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:pb-10 sm:pt-8 lg:pb-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
        Mis pedidos
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Historial de compras realizadas desde tu cuenta.
      </p>

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
            className="font-semibold text-[var(--color-forest)] dark:text-emerald-400"
          >
            Ir al catálogo
          </Link>
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {data.map((o) => (
            <li key={o.id}>
              <Link
                to={routePaths.orderDetail(o.id)}
                className="block rounded-3xl bg-white p-5 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 transition hover:ring-zinc-300 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-zinc-400">{o.id}</p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      {o.store?.name ?? 'Tienda'}
                    </p>
                    <p className="mt-2 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                      {formatPrice(numAmount(o.totalAmount))}
                    </p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {formatOrderStatus(o.status)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
