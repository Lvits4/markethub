import { useState, type ComponentType, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiGrid,
  FiLogOut,
  FiMoon,
  FiPackage,
  FiSettings,
  FiShield,
  FiShoppingBag,
  FiShoppingCart,
  FiSun,
  FiTag,
  FiUsers,
} from 'react-icons/fi';
import { AdminAccountSettingsDrawer } from '../../components/AdminAccountSettingsDrawer/AdminAccountSettingsDrawer';
import { Button } from '../../components/Button/Button';
import { useTheme } from '../../hooks/useTheme';
import { routePaths } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';
import { useRejectedStoresQuery } from '../../queries/useRejectedStoresQuery';

type NavItemProps = {
  to: string;
  end?: boolean;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  label: string;
  collapsed: boolean;
  badge?: ReactNode;
  collapsedBadgeCount?: number;
};

const sidebarLabelGrid =
  'grid min-w-0 transition-[grid-template-columns] duration-200 ease-out motion-reduce:transition-none';

function SidebarNavItem({
  to,
  end,
  icon: Icon,
  label,
  collapsed,
  badge,
  collapsedBadgeCount,
}: NavItemProps) {
  const collapsedBadge =
    collapsed && collapsedBadgeCount != null && collapsedBadgeCount > 0 ? (
      <span className="absolute right-0 top-0 inline-flex h-4 min-w-4 translate-x-0.5 -translate-y-0.5 items-center justify-center rounded-full bg-admin-primary px-0.5 text-[9px] font-bold leading-none tabular-nums text-white">
        {collapsedBadgeCount > 9 ? '9+' : collapsedBadgeCount}
      </span>
    ) : null;

  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          'admin-nav-link relative',
          isActive ? 'admin-nav-link--active' : '',
        ]
          .filter(Boolean)
          .join(' ')
      }
    >
      <span className="relative inline-flex shrink-0">
        <Icon className="h-[18px] w-[18px]" aria-hidden />
        {collapsedBadge}
      </span>
      <div
        className={`${sidebarLabelGrid} ${collapsed ? 'grid-cols-[0fr]' : 'grid-cols-[1fr]'}`}
        aria-hidden={collapsed}
      >
        <div className="min-w-0 overflow-hidden">
          <span className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {badge}
          </span>
        </div>
      </div>
    </NavLink>
  );
}

export function AdminLayout() {
  const { logout, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();
  const { pathname: adminOutletPath } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const { data: rejectedStores } = useRejectedStoresQuery();
  const pendingCount = rejectedStores?.length ?? 0;

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate(routePaths.login, { replace: true });
  };

  const displayName = user?.email
    ? user.email.split('@')[0]?.replace(/\./g, ' ') ??
      (isAdmin ? 'Admin' : 'Vendedor')
    : isAdmin
      ? 'Admin'
      : 'Vendedor';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const moderationBadge =
    pendingCount > 0 ? (
      <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-admin-primary px-1 text-[10px] font-bold leading-none tabular-nums text-white">
        {pendingCount > 99 ? '99+' : pendingCount}
      </span>
    ) : null;

  return (
    <>
    <div className="admin-shell flex h-dvh max-h-dvh min-h-0 overflow-hidden bg-[var(--admin-page-bg)] text-zinc-800 dark:text-zinc-100">
      <aside
        className={`flex min-h-0 shrink-0 flex-col overflow-x-hidden border-r border-[var(--admin-border)] bg-[var(--admin-card)] transition-[width] duration-200 ease-out dark:bg-night-900 ${collapsed ? 'w-[72px]' : 'w-[248px]'}`}
        aria-label="Navegación del panel"
      >
        <div
          className={`flex shrink-0 border-b border-[var(--admin-border)] ${collapsed ? 'flex-col items-center gap-1.5 py-2.5' : 'h-14 items-center justify-between gap-2 px-3'}`}
        >
          <div
            className={`flex min-w-0 items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}
          >
            <div
              className="box-border flex aspect-square h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[9999px] border border-white/30 bg-admin-primary text-sm font-bold text-white shadow-sm"
              aria-hidden
            >
              M
            </div>
            <div
              className={`${sidebarLabelGrid} min-w-0 ${collapsed ? 'grid-cols-[0fr]' : 'grid-cols-[1fr] flex-1'}`}
            >
              <div className="min-w-0 overflow-hidden">
                <span
                  className={`block truncate text-lg font-bold tracking-tight text-zinc-900 transition-opacity duration-200 ease-out motion-reduce:transition-none dark:text-zinc-50 ${collapsed ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
                  aria-hidden={collapsed}
                >
                  MarketHub
                </span>
              </div>
            </div>
            {collapsed ? (
              <span className="sr-only">MarketHub</span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-night-800"
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            {collapsed ? (
              <FiChevronRight className="h-5 w-5" aria-hidden />
            ) : (
              <FiChevronLeft className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>

        <nav
          className={`market-scroll min-h-0 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-gutter:stable] ${collapsed ? 'admin-sidebar-nav--collapsed px-1.5 py-2' : 'p-3'}`}
        >
          <SidebarNavItem
            to={routePaths.admin}
            end
            icon={FiGrid}
            label="Panel"
            collapsed={collapsed}
          />
          {isAdmin ? (
            <SidebarNavItem
              to={routePaths.adminModeration}
              icon={FiShield}
              label="Moderación"
              collapsed={collapsed}
              badge={moderationBadge}
              collapsedBadgeCount={pendingCount}
            />
          ) : null}
          <SidebarNavItem
            to={routePaths.adminOrders}
            icon={FiShoppingCart}
            label="Pedidos"
            collapsed={collapsed}
          />
          <SidebarNavItem
            to={routePaths.adminStores}
            icon={FiShoppingBag}
            label="Tiendas"
            collapsed={collapsed}
          />
          <SidebarNavItem
            to={routePaths.adminProducts}
            icon={FiPackage}
            label="Productos"
            collapsed={collapsed}
          />
          {isAdmin ? (
            <SidebarNavItem
              to={routePaths.adminUsers}
              icon={FiUsers}
              label="Usuarios"
              collapsed={collapsed}
            />
          ) : null}
          {isAdmin ? (
            <SidebarNavItem
              to={routePaths.adminCategories}
              icon={FiTag}
              label="Categorías"
              collapsed={collapsed}
            />
          ) : null}
          <button
            type="button"
            title={collapsed ? 'Tienda pública' : undefined}
            onClick={() => navigate(routePaths.browse)}
            className={`admin-nav-link w-full ${collapsed ? 'text-center' : 'text-left'}`}
          >
            <FiExternalLink className="h-[18px] w-[18px] shrink-0" aria-hidden />
            <div
              className={`${sidebarLabelGrid} ${collapsed ? 'grid-cols-[0fr]' : 'grid-cols-[1fr]'}`}
              aria-hidden={collapsed}
            >
              <div className="min-w-0 overflow-hidden">
                <span className="block truncate">Ver tienda pública</span>
              </div>
            </div>
          </button>
          <div
            className={`admin-sidebar-icon-row flex items-center gap-3 rounded-md py-2.5 ${collapsed ? '' : 'px-3'}`}
          >
            {!collapsed ? (
              <>
                {theme === 'dark' ? (
                  <FiSun className="h-[18px] w-[18px] shrink-0 text-zinc-500" aria-hidden />
                ) : (
                  <FiMoon className="h-[18px] w-[18px] shrink-0 text-zinc-500" aria-hidden />
                )}
                <span className="flex-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Modo oscuro
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={theme === 'dark'}
                  onClick={toggleTheme}
                  className={`relative flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-card)] dark:focus-visible:ring-offset-night-900 ${theme === 'dark' ? 'bg-admin-primary' : 'bg-zinc-200 dark:bg-night-700'}`}
                >
                  <span
                    className={`h-3 w-3 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 ease-out dark:ring-white/10 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={toggleTheme}
                className="box-border inline-flex aspect-square h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-night-800"
                aria-label="Cambiar tema"
              >
                {theme === 'dark' ? (
                  <FiSun className="h-[18px] w-[18px]" aria-hidden />
                ) : (
                  <FiMoon className="h-[18px] w-[18px]" aria-hidden />
                )}
              </button>
            )}
          </div>
          <button
            type="button"
            title={collapsed ? 'Ajustes cuenta' : undefined}
            onClick={() => setAccountSettingsOpen(true)}
            className={[
              'admin-nav-link relative w-full',
              accountSettingsOpen ? 'admin-nav-link--active' : '',
              collapsed ? 'text-center' : 'text-left',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="relative inline-flex shrink-0">
              <FiSettings className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <div
              className={`${sidebarLabelGrid} ${collapsed ? 'grid-cols-[0fr]' : 'grid-cols-[1fr]'}`}
              aria-hidden={collapsed}
            >
              <div className="min-w-0 overflow-hidden">
                <span className="block min-w-0 flex-1 truncate">Ajustes cuenta</span>
              </div>
            </div>
          </button>
        </nav>

        <div
          className={`shrink-0 border-t border-[var(--admin-border)] ${collapsed ? 'flex flex-col items-center gap-3 p-2' : 'flex flex-col gap-3 p-3'}`}
        >
          <div
            className={`flex rounded-md bg-zinc-50 dark:bg-night-800/60 ${collapsed ? 'w-full flex-col items-center gap-1 p-2' : 'w-full items-center gap-3 p-2.5'}`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--admin-primary-soft)] text-sm font-semibold text-admin-primary">
              {initials}
            </div>
            <div
              className={`${sidebarLabelGrid} min-w-0 ${collapsed ? 'grid-cols-[0fr]' : 'grid-cols-[1fr] flex-1'}`}
            >
              <div className="min-w-0 overflow-hidden">
                <div
                  className={`min-w-0 flex-1 transition-opacity duration-200 ease-out motion-reduce:transition-none ${collapsed ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
                  aria-hidden={collapsed}
                >
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {user?.email ?? (isAdmin ? 'Administrador' : 'Vendedor')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className={`gap-2 border-zinc-200 text-sm text-zinc-700 dark:border-night-700 dark:text-zinc-200 ${collapsed ? 'flex h-10 w-10 shrink-0 items-center justify-center p-0' : 'w-full justify-center'}`}
            onClick={handleLogout}
          >
            <FiLogOut className="h-4 w-4 shrink-0" aria-hidden />
            <span
              className={`${sidebarLabelGrid} min-w-0 ${collapsed ? 'grid-cols-[0fr]' : 'grid-cols-[1fr]'}`}
              aria-hidden={collapsed}
            >
              <span className="min-w-0 overflow-hidden whitespace-nowrap">
                Cerrar sesión
              </span>
            </span>
          </Button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-5 md:p-8">
          <div className="mx-auto flex min-h-0 w-full max-w-[1360px] flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain [scrollbar-gutter:stable]">
            <div
              key={adminOutletPath}
              className="route-outlet-fade flex min-h-0 min-w-0 flex-1 flex-col"
            >
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
    <AdminAccountSettingsDrawer
      open={accountSettingsOpen}
      onClose={() => setAccountSettingsOpen(false)}
      onLogoutSuccess={() => {
        setAccountSettingsOpen(false);
        navigate(routePaths.login, { replace: true });
      }}
    />
    </>
  );
}
