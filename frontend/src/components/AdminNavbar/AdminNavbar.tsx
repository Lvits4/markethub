import { useEffect, useRef, useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiClipboard,
  FiDollarSign,
  FiGrid,
  FiLogOut,
  FiMoon,
  FiPackage,
  FiSettings,
  FiShield,
  FiShoppingBag,
  FiSun,
  FiTag,
  FiUsers,
} from 'react-icons/fi';
import type { ThemeMode } from '../../context/ThemeProvider/ThemeProvider';
import type { AuthUser } from '../../types/user/user';
import { routePaths } from '../../config/routes';

type PageMeta = { title: string; icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }> };

const PAGE_META: Record<string, PageMeta> = {
  [routePaths.admin]: { title: 'Panel', icon: FiGrid },
  [routePaths.adminModeration]: { title: 'Moderación', icon: FiShield },
  [routePaths.adminStores]: { title: 'Tiendas', icon: FiShoppingBag },
  [routePaths.adminProducts]: { title: 'Productos', icon: FiPackage },
  [routePaths.adminEarnings]: { title: 'Ganancias', icon: FiDollarSign },
  [routePaths.adminUsers]: { title: 'Usuarios', icon: FiUsers },
  [routePaths.adminCategories]: { title: 'Categorías', icon: FiTag },
  [routePaths.seller]: { title: 'Panel', icon: FiGrid },
  [routePaths.sellerStores]: { title: 'Tiendas', icon: FiShoppingBag },
  [routePaths.sellerOrders]: { title: 'Pedidos', icon: FiClipboard },
  [routePaths.sellerProducts]: { title: 'Productos', icon: FiPackage },
  [routePaths.sellerVentas]: { title: 'Ventas', icon: FiDollarSign },

};

function getPageMeta(pathname: string): PageMeta {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  if (pathname.startsWith(routePaths.adminModeration)) return PAGE_META[routePaths.adminModeration];
  if (pathname.startsWith(routePaths.adminStores)) return PAGE_META[routePaths.adminStores];
  if (pathname.startsWith(routePaths.adminProducts)) return PAGE_META[routePaths.adminProducts];
  if (pathname.startsWith(routePaths.adminEarnings)) return PAGE_META[routePaths.adminEarnings];
  if (pathname.startsWith(routePaths.adminUsers)) return PAGE_META[routePaths.adminUsers];
  if (pathname.startsWith(routePaths.adminCategories)) return PAGE_META[routePaths.adminCategories];
  if (pathname.startsWith(routePaths.sellerStores)) return PAGE_META[routePaths.sellerStores];
  if (pathname.startsWith(routePaths.sellerOrders)) return PAGE_META[routePaths.sellerOrders];
  if (pathname.startsWith(routePaths.sellerProducts)) return PAGE_META[routePaths.sellerProducts];
  if (pathname.startsWith(routePaths.sellerVentas)) return PAGE_META[routePaths.sellerVentas];
  if (pathname.startsWith('/seller')) return PAGE_META[routePaths.seller];
  return PAGE_META[routePaths.admin];
}

function getDisplayName(user: AuthUser | null): string {
  if (!user) return 'Admin';
  const full = `${user.firstName} ${user.lastName}`.trim();
  if (full) return full;
  return user.email.split('@')[0]?.replace(/\./g, ' ') ?? 'Admin';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

type AdminNavbarProps = {
  pathname: string;
  user: AuthUser | null;
  isAdmin: boolean;
  pendingCount: number;
  theme: ThemeMode;
  toggleTheme: () => void;
  onAccountSettingsOpen: () => void;
  onLogout: () => void;
};

export function AdminNavbar({
  pathname,
  user,
  isAdmin,
  pendingCount,
  theme,
  toggleTheme,
  onAccountSettingsOpen,
  onLogout,
}: AdminNavbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const pageTitle = getPageMeta(pathname);
  const PageIcon = pageTitle.icon;
  const initials = user ? getInitials(getDisplayName(user)) : 'A';
  const roleLabel = user?.role === 'ADMIN' ? 'Admin' : user?.role === 'SELLER' ? 'Vendedor' : 'Usuario';

  useEffect(() => {
    if (!notifOpen && !userOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (
        notifOpen &&
        notifRef.current &&
        !notifRef.current.contains(e.target as Node)
      )
        setNotifOpen(false);
      if (
        userOpen &&
        userRef.current &&
        !userRef.current.contains(e.target as Node)
      )
        setUserOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [notifOpen, userOpen]);

  return (
    <header className="admin-top-bar sticky top-0 z-30 flex h-14 shrink-0 items-center justify-center border-b border-(--admin-border) bg-white/72 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.75)] backdrop-blur-2xl backdrop-saturate-150 supports-backdrop-filter:bg-white/52 dark:bg-transparent dark:shadow-none dark:backdrop-blur-none supports-backdrop-filter:dark:bg-transparent">
      <div className="flex h-full w-[min(100%,1360px)] items-center justify-between gap-4 px-5 md:px-8">
        <h1 className="flex min-w-0 items-center gap-2 text-lg font-semibold text-page-title dark:text-zinc-50">
          <PageIcon className="h-5 w-5 shrink-0" aria-hidden />
          {pageTitle.title}
        </h1>

        <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={toggleTheme}
        className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-night-800"
        aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      >
        {theme === 'dark' ? (
          <FiSun className="h-[18px] w-[18px]" aria-hidden />
        ) : (
          <FiMoon className="h-[18px] w-[18px]" aria-hidden />
        )}
      </button>

      {isAdmin && (
      <div ref={notifRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setUserOpen(false);
            setNotifOpen((v) => !v);
          }}
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-night-800"
          aria-expanded={notifOpen}
          aria-label="Notificaciones"
        >
          <FiBell className="h-[18px] w-[18px]" aria-hidden />
          {pendingCount > 0 ? (
            <span className="absolute right-0.5 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-admin-primary px-0.5 text-[9px] font-bold leading-none tabular-nums text-white">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          ) : null}
        </button>

        {notifOpen && (
          <div
            role="dialog"
            className="absolute right-0 top-[calc(100%+0.5rem)] w-56 rounded-lg border border-zinc-200/80 bg-white py-1 shadow-lg ring-1 ring-black/5 dark:border-night-700 dark:bg-admin-dropdown dark:ring-white/5"
          >
            {pendingCount > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(false);
                  navigate(routePaths.adminModeration);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-night-800"
              >
                <FiShield className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                <span className="flex-1">{pendingCount} {pendingCount === 1 ? 'tienda pendiente' : 'tiendas pendientes'}</span>
              </button>
            ) : (
              <p className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500">
                Sin notificaciones
              </p>
            )}
          </div>
        )}
      </div>
      )}

      <div ref={userRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setNotifOpen(false);
            setUserOpen((v) => !v);
          }}
          className="flex items-center justify-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-night-800"
          aria-expanded={userOpen}
          aria-label="Menú de usuario"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-(--admin-primary-soft) text-xs font-semibold text-admin-primary">
            {initials}
          </div>
          <div className="hidden min-w-0 flex-col items-stretch gap-0 sm:flex">
            <p className="truncate text-left text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {roleLabel}
            </p>
            <p className="truncate text-left text-xs text-zinc-500 dark:text-zinc-400">
              {user?.email ?? ''}
            </p>
          </div>
        </button>

        {userOpen && (
          <div
            role="dialog"
            className="absolute right-0 top-[calc(100%+0.5rem)] w-60 rounded-xl border border-zinc-200/80 bg-white p-0 shadow-lg ring-1 ring-black/5 dark:border-night-700 dark:bg-admin-dropdown dark:ring-white/5"
          >
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setUserOpen(false);
                  onAccountSettingsOpen();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-night-800"
              >
                <FiSettings className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                Ajustes de cuenta
              </button>
            </div>

            <div className="border-t border-zinc-100 py-1 dark:border-night-700">
              <button
                type="button"
                onClick={() => {
                  setUserOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <FiLogOut className="h-4 w-4 shrink-0" aria-hidden />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
        </div>
        </div>
      </div>
    </header>
  );
}
