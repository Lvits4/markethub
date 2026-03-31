import { Link } from 'react-router-dom';
import { routePaths } from '../../config/routes';
import { useMyStoresQuery } from '../../queries/useMyStoresQuery';

export function SellerDashboardPage() {
  const { data: stores } = useMyStoresQuery();

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Resumen
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Accesos rápidos al panel de ventas.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li>
          <Link
            to={routePaths.sellerStores}
            className="block rounded-3xl bg-white p-6 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 transition hover:ring-zinc-300 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              Mis tiendas
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {stores?.length ?? '…'} tienda(s)
            </p>
          </Link>
        </li>
        <li>
          <Link
            to={routePaths.sellerOrders}
            className="block rounded-3xl bg-white p-6 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 transition hover:ring-zinc-300 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              Pedidos
            </p>
            <p className="mt-1 text-sm text-zinc-500">Ver y actualizar estado</p>
          </Link>
        </li>
        <li>
          <Link
            to={routePaths.sellerReport}
            className="block rounded-3xl bg-white p-6 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 transition hover:ring-zinc-300 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              Informe de ventas
            </p>
            <p className="mt-1 text-sm text-zinc-500">Métricas y productos</p>
          </Link>
        </li>
      </ul>
    </div>
  );
}
