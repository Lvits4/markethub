import { useState, type ComponentType } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiExternalLink,
  FiGrid,
  FiShield,
  FiShoppingBag,
  FiTag,
  FiUsers,
} from 'react-icons/fi';
import { AdminAccountSettingsDrawer } from '../../components/AdminAccountSettingsDrawer/AdminAccountSettingsDrawer';
import { AdminNavbar } from '../../components/AdminNavbar/AdminNavbar';
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
};

const sidebarLabelGrid =
  'grid min-w-0 transition-[grid-template-columns] duration-200 ease-out motion-reduce:transition-none';

function SidebarNavItem({
  to,
  end,
  icon: Icon,
  label,
  collapsed,
}: NavItemProps) {
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
          </span>
      <div
        className={`${sidebarLabelGrid} ${collapsed ? 'grid-cols-[0fr]' : 'grid-cols-[1fr]'}`}
        aria-hidden={collapsed}
      >
        <div className="min-w-0 overflow-hidden">
            <span className="flex min-w-0 items-center gap-2">
              <span className="min-w-0 flex-1 truncate">{label}</span>
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

  return (
    <>
      <div className="admin-shell flex h-dvh max-h-dvh min-h-0 overflow-hidden bg-[var(--admin-page-bg)] text-zinc-800 dark:text-zinc-100">
        <aside
          className={`admin-sidebar-rail flex min-h-0 shrink-0 flex-col overflow-x-hidden border-r border-[var(--admin-border)] bg-[var(--admin-card)] transition-[width] duration-200 ease-out ${collapsed ? 'w-[72px]' : 'w-[248px]'}`}
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
            className={`market-scroll min-h-0 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-gutter:stable] ${collapsed ? 'admin-sidebar-nav--collapsed px-0 py-2' : 'p-3'}`}
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
        />
            ) : null}
            <SidebarNavItem
              to={routePaths.adminStores}
              icon={FiShoppingBag}
              label="Tiendas"
              collapsed={collapsed}
            />
            {isAdmin ? (
              <SidebarNavItem
                to={routePaths.adminEarnings}
                icon={FiDollarSign}
                label="Ganancias"
                collapsed={collapsed}
              />
            ) : null}
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
          </nav>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AdminNavbar
            pathname={adminOutletPath}
            user={user}
            isAdmin={isAdmin}
            pendingCount={pendingCount}
            theme={theme}
            toggleTheme={toggleTheme}
            onAccountSettingsOpen={() => setAccountSettingsOpen(true)}
            onLogout={handleLogout}
          />
          <main className="admin-main-area flex min-h-0 flex-1 flex-col items-center overflow-hidden py-5 md:py-8">
            <div className="flex min-h-0 w-[min(100%,1360px)] flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain px-5 md:px-8 [scrollbar-gutter:stable]">
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
