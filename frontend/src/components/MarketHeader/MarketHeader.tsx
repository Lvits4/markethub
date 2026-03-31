import { NavLink } from 'react-router-dom';
import {
  FiHeart,
  FiHome,
  FiSettings,
  FiShoppingBag,
} from 'react-icons/fi';
import { routePaths } from '../../config/routes';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

const navInactive =
  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100';

const navActive =
  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold bg-[var(--color-forest)]/10 text-[var(--color-forest)] dark:bg-emerald-500/15 dark:text-emerald-400';

export function MarketHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-[var(--color-surface-cream)]/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3">
        <NavLink
          to={routePaths.catalog}
          end
          className="shrink-0 text-lg font-bold tracking-tight text-[var(--color-forest)] dark:text-emerald-400"
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
          <NavLink
            to={routePaths.settings}
            className={({ isActive }) => (isActive ? navActive : navInactive)}
          >
            <FiSettings className="h-4 w-4" aria-hidden />
            Ajustes
          </NavLink>
        </nav>

        <NavLink
          to={routePaths.cart}
          className="flex rounded-xl p-2.5 text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 lg:hidden"
          aria-label="Carrito"
        >
          <FiShoppingBag className="h-5 w-5" />
        </NavLink>
        <ThemeToggle />
      </div>
    </header>
  );
}
