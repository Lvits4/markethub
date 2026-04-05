import { NavLink } from 'react-router-dom';
import {
  FiHeart,
  FiHome,
  FiLayers,
  FiPackage,
  FiSettings,
  FiShoppingBag,
} from 'react-icons/fi';
import { routePaths } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';
import { MarketHubMark } from '../AuthBrand/AuthBrand';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

const navInactive =
  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-night-800 dark:hover:text-zinc-100';

const navActive =
  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold bg-forest/10 text-forest dark:bg-market-dark-surface dark:text-market-dark-accent dark:shadow-[0_1px_2px_rgba(0,0,0,0.2)]';

const headerBarClass =
  'fixed top-0 right-0 left-0 z-50 h-14 border-b border-zinc-300/70 bg-white/75 shadow-[0_10px_40px_-18px_rgba(15,23,42,0.18)] backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/65 dark:border-night-600/70 dark:bg-night-950/75 dark:shadow-[0_12px_40px_-14px_rgba(0,0,0,0.55)] dark:backdrop-blur-3xl dark:backdrop-saturate-150 supports-[backdrop-filter]:dark:bg-night-950/65';

export function MarketHeader() {
  const { isAuthenticated } = useAuth();

  return (
    <header className={headerBarClass}>
      <div className="mx-auto flex h-full w-full max-w-6xl items-center gap-2 px-4 sm:gap-3">
        <NavLink
          to={routePaths.catalog}
          end
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-forest"
        >
          <MarketHubMark size="nav" />
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
          <NavLink
            to={routePaths.settings}
            className={({ isActive }) => (isActive ? navActive : navInactive)}
          >
            <FiSettings className="h-4 w-4" aria-hidden />
            Ajustes
          </NavLink>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
