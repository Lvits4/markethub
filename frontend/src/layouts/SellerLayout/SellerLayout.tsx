import { NavLink, Outlet } from 'react-router-dom';
import { SellerCreateStoreModalProvider } from '../../context/SellerCreateStoreModalProvider/SellerCreateStoreModalProvider';
import { routePaths } from '../../config/routes';

const navClass =
  'rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-night-800 dark:hover:text-zinc-100';

const activeClass =
  'bg-[var(--color-forest)]/10 text-[var(--color-forest)] dark:bg-[color:rgb(16_34_81/0.65)] dark:text-[var(--color-market-dark-accent)]';

export function SellerLayout() {
  return (
    <SellerCreateStoreModalProvider>
    <div className="min-h-screen bg-zinc-50/80 pb-24 dark:bg-night-950/80">
      <div className="border-b border-zinc-200 bg-white dark:border-night-800 dark:bg-night-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Panel vendedor
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Gestiona tiendas, productos y pedidos
            </p>
          </div>
          <nav className="flex flex-wrap gap-1" aria-label="Vendedor">
            <NavLink
              to={routePaths.seller}
              end
              className={({ isActive }) =>
                `${navClass} ${isActive ? activeClass : ''}`
              }
            >
              Inicio
            </NavLink>
            <NavLink
              to={routePaths.sellerOrders}
              className={({ isActive }) =>
                `${navClass} ${isActive ? activeClass : ''}`
              }
            >
              Pedidos
            </NavLink>
            <NavLink
              to={routePaths.sellerReport}
              className={({ isActive }) =>
                `${navClass} ${isActive ? activeClass : ''}`
              }
            >
              Informe
            </NavLink>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </div>
    </div>
    </SellerCreateStoreModalProvider>
  );
}
