import { NavLink } from 'react-router-dom';
import { FiHeart, FiHome, FiLayers, FiSettings, FiShoppingBag } from 'react-icons/fi';
import { routePaths } from '../../config/routes';

const linkClass =
  'flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 text-[9px] font-medium leading-tight text-zinc-400 transition sm:text-[10px]';

const activeClass =
  '!font-semibold !text-white dark:!text-[var(--color-market-dark-accent)]';

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-lg px-4 pb-4 pt-2 lg:hidden"
      aria-label="Principal"
    >
      <div className="flex items-stretch justify-between rounded-md bg-[var(--color-forest)] px-2 py-2 shadow-[var(--shadow-market)] backdrop-blur-md dark:bg-[var(--color-market-dark-surface)] dark:ring-1 dark:ring-[color:rgb(69_139_222/0.22)] dark:backdrop-blur-xl">
        <NavLink
          to={routePaths.catalog}
          end
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          <FiHome className="h-5 w-5 shrink-0" aria-hidden />
          Inicio
        </NavLink>
        <NavLink
          to={routePaths.stores}
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          <FiLayers className="h-5 w-5 shrink-0" aria-hidden />
          Tiendas
        </NavLink>
        <NavLink
          to={routePaths.favorites}
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          <FiHeart className="h-5 w-5 shrink-0" aria-hidden />
          Favoritos
        </NavLink>
        <NavLink
          to={routePaths.cart}
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          <FiShoppingBag className="h-5 w-5 shrink-0" aria-hidden />
          Carrito
        </NavLink>
        <NavLink
          to={routePaths.settings}
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          <FiSettings className="h-5 w-5 shrink-0" aria-hidden />
          Ajustes
        </NavLink>
      </div>
    </nav>
  );
}
