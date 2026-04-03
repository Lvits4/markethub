import { NavLink } from 'react-router-dom';
import {
  FiHeart,
  FiGrid,
  FiHome,
  FiLayers,
  FiPackage,
  FiSettings,
  FiShoppingBag,
} from 'react-icons/fi';
import { routePaths } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

const navInactive =
  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-night-800 dark:hover:text-zinc-100';

const navActive =
  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold bg-[var(--color-forest)]/10 text-[var(--color-forest)] dark:bg-[var(--color-market-dark-surface)] dark:text-[var(--color-market-dark-accent)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2)]';

export function MarketHeader() {
  const { isAuthenticated, user } = useAuth();
  const showSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-[var(--color-surface-cream)]/90 backdrop-blur-md dark:border-night-700/80 dark:bg-night-950/75 dark:backdrop-blur-xl dark:backdrop-saturate-150">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3">
        <NavLink
          to={routePaths.catalog}
          end
          className="shrink-0 text-lg font-bold tracking-tight text-[var(--color-forest)]"
        >
          MarketHub
        </NavLink>

        <div className="min-w-0 flex-1" aria-hidden />

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Principal escritorio"
        >
          <NavLink
            to={routePaths.catalog}
            end
            className={({ isActive }) => (isActive ? navActive : navInactive)}
          >
            <FiHome className="h-4 w-4" aria-hidden />
            Inicio
          </NavLink>
          <NavLink
            to={routePaths.stores}
            className={({ isActive }) => (isActive ? navActive : navInactive)}
          >
            <FiLayers className="h-4 w-4" aria-hidden />
            Tiendas
          </NavLink>
          <NavLink
            to={routePaths.favorites}
            className={({ isActive }) => (isActive ? navActive : navInactive)}
          >
            <FiHeart className="h-4 w-4" aria-hidden />
            Favoritos
          </NavLink>
          <NavLink
            to={routePaths.cart}
            className={({ isActive }) => (isActive ? navActive : navInactive)}
          >
            <FiShoppingBag className="h-4 w-4" aria-hidden />
            Carrito
          </NavLink>
          {isAuthenticated ? (
            <NavLink
              to={routePaths.orders}
              className={({ isActive }) => (isActive ? navActive : navInactive)}
            >
              <FiPackage className="h-4 w-4" aria-hidden />
              Pedidos
            </NavLink>
          ) : null}
          {showSeller ? (
            <NavLink
              to={routePaths.admin}
              className={({ isActive }) => (isActive ? navActive : navInactive)}
            >
              <FiGrid className="h-4 w-4" aria-hidden />
              Vender
            </NavLink>
          ) : null}
          <NavLink
            to={routePaths.settings}
            className={({ isActive }) => (isActive ? navActive : navInactive)}
          >
            <FiSettings className="h-4 w-4" aria-hidden />
            Ajustes
          </NavLink>
        </nav>

        <NavLink
          to={routePaths.stores}
          className="flex rounded-md p-2.5 text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-night-800 lg:hidden"
          aria-label="Tiendas"
        >
          <FiLayers className="h-5 w-5" />
        </NavLink>
        <NavLink
          to={routePaths.cart}
          className="flex rounded-md p-2.5 text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-night-800 lg:hidden"
          aria-label="Carrito"
        >
          <FiShoppingBag className="h-5 w-5" />
        </NavLink>
        {isAuthenticated ? (
          <NavLink
            to={routePaths.orders}
            className="flex rounded-md p-2.5 text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-night-800 lg:hidden"
            aria-label="Mis pedidos"
          >
            <FiPackage className="h-5 w-5" />
          </NavLink>
        ) : null}
        <ThemeToggle />
      </div>
    </header>
  );
}
