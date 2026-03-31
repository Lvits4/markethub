import { NavLink } from 'react-router-dom';
import { FiHeart, FiHome, FiSettings, FiShoppingBag } from 'react-icons/fi';
import { routePaths } from '../../config/routes';

const linkClass =
  'flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium text-zinc-400 transition';

const activeClass = '!text-white';

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-lg px-4 pb-4 pt-2 lg:hidden"
      aria-label="Principal"
    >
      <div className="flex items-stretch justify-between rounded-2xl bg-[var(--color-forest)] px-2 py-2 shadow-[var(--shadow-market)] dark:bg-emerald-950 dark:ring-1 dark:ring-emerald-900/50">
        <NavLink
          to={routePaths.catalog}
          end
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          <FiHome className="h-5 w-5" aria-hidden />
          Inicio
        </NavLink>
        <NavLink
          to={routePaths.favorites}
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          <FiHeart className="h-5 w-5" aria-hidden />
          Favoritos
        </NavLink>
        <NavLink
          to={routePaths.cart}
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          <FiShoppingBag className="h-5 w-5" aria-hidden />
          Carrito
        </NavLink>
        <NavLink
          to={routePaths.settings}
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          <FiSettings className="h-5 w-5" aria-hidden />
          Ajustes
        </NavLink>
      </div>
    </nav>
  );
}
