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

const linkBase =
  'flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 text-[9px] font-medium leading-tight transition sm:text-[10px]';

/** Inactivos: blanco suave; activos: blanco pleno + semibold */
const linkInactive =
  `${linkBase} text-white/72 hover:text-white/88 dark:text-white/50 dark:hover:text-white/72`;

const linkActive = `${linkBase} font-semibold text-white dark:text-white`;

const iconProps = {
  className: 'h-5 w-5 shrink-0' as const,
  strokeWidth: 2.25 as const,
  'aria-hidden': true as const,
};

export function BottomNav() {
  const { isAuthenticated } = useAuth();

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-40 mx-auto max-w-lg px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
      aria-label="Principal"
    >
      <div className="flex items-stretch justify-between rounded-md bg-forest px-1.5 py-2 shadow-market backdrop-blur-md dark:bg-market-dark-surface dark:ring-1 dark:ring-market-dark-accent/22 dark:backdrop-blur-xl">
        <NavLink
          to={routePaths.catalog}
          end
          className={({ isActive }) =>
            `${isActive ? linkActive : linkInactive}`
          }
        >
          <FiHome {...iconProps} />
          Inicio
        </NavLink>
        <NavLink
          to={routePaths.stores}
          className={({ isActive }) =>
            `${isActive ? linkActive : linkInactive}`
          }
        >
          <FiLayers {...iconProps} />
          Tiendas
        </NavLink>
        <NavLink
          to={routePaths.favorites}
          className={({ isActive }) =>
            `${isActive ? linkActive : linkInactive}`
          }
        >
          <FiHeart {...iconProps} />
          Favoritos
        </NavLink>
        <NavLink
          to={routePaths.cart}
          className={({ isActive }) =>
            `${isActive ? linkActive : linkInactive}`
          }
        >
          <FiShoppingBag {...iconProps} />
          Carrito
        </NavLink>
        {isAuthenticated ? (
          <NavLink
            to={routePaths.orders}
            className={({ isActive }) =>
              `${isActive ? linkActive : linkInactive}`
            }
          >
            <FiPackage {...iconProps} />
            Pedidos
          </NavLink>
        ) : null}
        <NavLink
          to={routePaths.settings}
          className={({ isActive }) =>
            `${isActive ? linkActive : linkInactive}`
          }
        >
          <FiSettings {...iconProps} />
          Ajustes
        </NavLink>
      </div>
    </nav>
  );
}
