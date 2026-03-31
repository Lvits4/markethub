import { useState, type ComponentType, type ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiGrid,
  FiLogOut,
  FiMoon,
  FiPackage,
  FiPercent,
  FiSettings,
  FiShield,
  FiShoppingBag,
  FiShoppingCart,
  FiSun,
  FiTag,
  FiUsers,
} from 'react-icons/fi';
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
      <span className="absolute right-0 top-0 flex h-4 min-w-4 translate-x-0.5 -translate-y-0.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white">
        {collapsedBadgeCount > 9 ? '9+' : collapsedBadgeCount}
      </span>
    ) : null;

  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          'admin-nav-link relative',
          isActive ? 'admin-nav-link--active' : '',
          collapsed ? 'justify-center px-2' : '',
        ]
          .filter(Boolean)
          .join(' ')
      }
    >
      <span className="relative inline-flex shrink-0">
        <Icon className="h-[18px] w-[18px]" aria-hidden />
        {collapsedBadge}
      </span>
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {badge}
        </>
      ) : null}
    </NavLink>
  );
}

type RailItemProps = {
  to: string;
  end?: boolean;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  label: string;
};

function RailLink({ to, end, icon: Icon, label }: RailItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      title={label}
      className={({ isActive }) =>
        ['admin-rail-link', isActive ? 'admin-rail-link--active' : '']
          .filter(Boolean)
          .join(' ')
      }
    >
      <Icon className="h-5 w-5" aria-hidden />
    </NavLink>
  );
}

function SectionLabel({
  collapsed,
  children,
}: {
  collapsed: boolean;
  children: ReactNode;
}) {
  if (collapsed) {
    return <div className="mx-2 my-2 border-t border-[var(--admin-border)]" />;
  }
  return (
    <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
      {children}
    </p>
  );
}

export function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const { data: rejectedStores } = useRejectedStoresQuery();
  const pendingCount = rejectedStores?.length ?? 0;

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate(routePaths.login, { replace: true });
  };

  const displayName = user?.email
    ? user.email.split('@')[0]?.replace(/\./g, ' ') ?? 'Admin'
    : 'Admin';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const moderationBadge =
    pendingCount > 0 ? (
      <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
        {pendingCount > 99 ? '99+' : pendingCount}
      </span>
    ) : null;

  return (
    <div className="admin-shell flex min-h-screen bg-[var(--admin-page-bg)] text-zinc-800 dark:text-zinc-100">
      <aside
        className="flex w-[52px] shrink-0 flex-col items-center border-r border-[var(--admin-border)] bg-[var(--admin-card)] py-4 dark:bg-zinc-900"
        aria-label="Accesos rápidos"
      >
        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--admin-primary)] text-sm font-bold text-white">
          M
        </div>
        <nav className="flex flex-col gap-1">
          <RailLink
            to={routePaths.admin}
            end
            icon={FiGrid}
            label="Panel"
          />
          <RailLink to={routePaths.adminStores} icon={FiShoppingBag} label="Tiendas" />
          <RailLink to={routePaths.adminOrders} icon={FiShoppingCart} label="Pedidos" />
          <RailLink to={routePaths.adminUsers} icon={FiUsers} label="Clientes" />
          <RailLink to={routePaths.adminSales} icon={FiBarChart2} label="Informes" />
        </nav>
      </aside>

      <aside
        className={`flex shrink-0 flex-col border-r border-[var(--admin-border)] bg-[var(--admin-card)] transition-[width] duration-200 ease-out dark:bg-zinc-900 ${collapsed ? 'w-[72px]' : 'w-[248px]'}`}
        aria-label="Navegación del panel"
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-[var(--admin-border)] px-3">
          {!collapsed ? (
            <span className="truncate text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              MarketHub
            </span>
          ) : (
            <span className="sr-only">MarketHub</span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
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

        <nav className="flex-1 space-y-5 overflow-y-auto p-3">
          <div>
            <SectionLabel collapsed={collapsed}>Mercado</SectionLabel>
            <div className="space-y-0.5">
              <SidebarNavItem
                to={routePaths.admin}
                end
                icon={FiGrid}
                label="Panel"
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
              <SidebarNavItem
                to={routePaths.adminModeration}
                icon={FiShield}
                label="Moderación"
                collapsed={collapsed}
                badge={moderationBadge}
                collapsedBadgeCount={pendingCount}
              />
              <SidebarNavItem
                to={routePaths.adminOrders}
                icon={FiShoppingCart}
                label="Pedidos"
                collapsed={collapsed}
              />
            </div>
          </div>

          <div>
            <SectionLabel collapsed={collapsed}>Clientes</SectionLabel>
            <div className="space-y-0.5">
              <SidebarNavItem
                to={routePaths.adminUsers}
                icon={FiUsers}
                label="Usuarios"
                collapsed={collapsed}
              />
            </div>
          </div>

          <div>
            <SectionLabel collapsed={collapsed}>Pagos e informes</SectionLabel>
            <div className="space-y-0.5">
              <SidebarNavItem
                to={routePaths.adminSales}
                icon={FiPercent}
                label="Ventas y comisiones"
                collapsed={collapsed}
              />
              <SidebarNavItem
                to={routePaths.adminCategories}
                icon={FiTag}
                label="Categorías"
                collapsed={collapsed}
              />
            </div>
          </div>

          <div>
            <SectionLabel collapsed={collapsed}>Sistema</SectionLabel>
            <div className="space-y-0.5">
              <button
                type="button"
                title={collapsed ? 'Tienda pública' : undefined}
                onClick={() => navigate(routePaths.browse)}
                className={`admin-nav-link w-full text-left ${collapsed ? 'justify-center px-2' : ''}`}
              >
                <FiExternalLink className="h-[18px] w-[18px] shrink-0" aria-hidden />
                {!collapsed ? (
                  <span className="truncate">Ver tienda pública</span>
                ) : null}
              </button>
              <div
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${collapsed ? 'justify-center px-2' : ''}`}
              >
                {theme === 'dark' ? (
                  <FiSun className="h-[18px] w-[18px] shrink-0 text-zinc-500" aria-hidden />
                ) : (
                  <FiMoon className="h-[18px] w-[18px] shrink-0 text-zinc-500" aria-hidden />
                )}
                {!collapsed ? (
                  <>
                    <span className="flex-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Modo oscuro
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={theme === 'dark'}
                      onClick={toggleTheme}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${theme === 'dark' ? 'bg-[var(--admin-primary)]' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'left-6' : 'left-1'}`}
                      />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    aria-label="Cambiar tema"
                  >
                    {theme === 'dark' ? (
                      <FiSun className="h-5 w-5" />
                    ) : (
                      <FiMoon className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
              <SidebarNavItem
                to={routePaths.settings}
                icon={FiSettings}
                label="Ajustes cuenta"
                collapsed={collapsed}
              />
            </div>
          </div>
        </nav>

        <div className="border-t border-[var(--admin-border)] p-3">
          <div
            className={`flex items-center gap-3 rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-800/60 ${collapsed ? 'flex-col' : ''}`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--admin-primary-soft)] text-sm font-semibold text-[var(--admin-primary)]">
              {initials}
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {displayName}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {user?.email ?? 'Administrador'}
                </p>
              </div>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full gap-2 border-zinc-200 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
            onClick={handleLogout}
          >
            <FiLogOut className="h-4 w-4" />
            {!collapsed ? 'Cerrar sesión' : null}
          </Button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-auto p-5 md:p-8">
          <div className="mx-auto max-w-[1360px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
