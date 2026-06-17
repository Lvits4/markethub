import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  TbBuildingStore,
  TbHeart,
  TbHome,
  TbPackage,
  TbShoppingCart,
  TbUserFilled,
} from 'react-icons/tb';
import { routePaths } from '../../config/routes';
import { useAccountSettingsPanel } from '../../context/AccountSettingsPanelProvider/AccountSettingsPanelProvider';
import { useAuth } from '../../hooks/useAuth/useAuth';

const iconClass =
  'h-[22px] w-[22px] shrink-0 stroke-[1.6] transition-[color,transform]';

function navItemClass(active: boolean) {
  return [
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-[background-color,color,transform]',
    'active:scale-[0.92]',
    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    'dark:focus-visible:ring-market-dark-accent/50 dark:focus-visible:ring-offset-zinc-900',
    active
      ? 'bg-forest text-white dark:bg-market-dark-surface dark:text-white'
      : 'text-zinc-500 hover:bg-zinc-200/55 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/6 dark:hover:text-zinc-100',
  ].join(' ');
}

function NavCell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center">
      {children}
    </div>
  );
}

export function BottomNav() {
  const { openPanel, isOpen } = useAccountSettingsPanel();
  const { isAuthenticated } = useAuth();

  return (
    <nav
      className="pointer-events-none fixed right-0 bottom-0 left-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
      aria-label="Principal"
    >
      <div className="pointer-events-auto mx-auto max-w-sm">
        <div
          className="flex h-14 items-center rounded-md border border-zinc-200/50 bg-white/45 px-1.5 shadow-[0_12px_40px_-10px_rgb(0_0_0/0.14),0_4px_16px_-6px_rgb(0_0_0/0.06)] shadow-zinc-900/5 backdrop-blur-xl backdrop-saturate-150 dark:border-white/6 dark:bg-night-900/95 dark:shadow-none dark:backdrop-blur-none"
          role="toolbar"
        >
          <NavCell>
            <NavLink
              to={routePaths.browse}
              end
              aria-label="Inicio"
              title="Inicio"
              className={({ isActive }) => navItemClass(isActive)}
            >
              <TbHome className={iconClass} aria-hidden />
            </NavLink>
          </NavCell>
          <NavCell>
            <NavLink
              to={routePaths.stores}
              aria-label="Tiendas"
              title="Tiendas"
              className={({ isActive }) => navItemClass(isActive)}
            >
              <TbBuildingStore className={iconClass} aria-hidden />
            </NavLink>
          </NavCell>
          <NavCell>
            <NavLink
              to={routePaths.cart}
              aria-label="Carrito"
              title="Carrito"
              className={({ isActive }) => navItemClass(isActive)}
            >
              <TbShoppingCart className={iconClass} aria-hidden />
            </NavLink>
          </NavCell>
          <NavCell>
            <NavLink
              to={routePaths.favorites}
              aria-label="Favoritos"
              title="Favoritos"
              className={({ isActive }) => navItemClass(isActive)}
            >
              <TbHeart className={iconClass} aria-hidden />
            </NavLink>
          </NavCell>
          {isAuthenticated ? (
            <NavCell>
              <NavLink
                to={routePaths.orders}
                aria-label="Pedidos"
                title="Pedidos"
                className={({ isActive }) => navItemClass(isActive)}
              >
                <TbPackage className={iconClass} aria-hidden />
              </NavLink>
            </NavCell>
          ) : null}
          <NavCell>
            <button
              type="button"
              className={navItemClass(isOpen)}
              aria-label="Ajustes de cuenta"
              title="Ajustes"
              aria-expanded={isOpen}
              onClick={openPanel}
            >
              <TbUserFilled
                className="h-[22px] w-[22px] shrink-0"
                aria-hidden
              />
            </button>
          </NavCell>
        </div>
      </div>
    </nav>
  );
}
