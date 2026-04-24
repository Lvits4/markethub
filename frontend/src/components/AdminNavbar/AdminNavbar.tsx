import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiLogOut,
  FiSettings,
  FiShield,
} from 'react-icons/fi';
import type { ThemeMode } from '../../context/ThemeProvider/ThemeProvider';
import type { AuthUser } from '../../types/user';
import { routePaths } from '../../config/routes';

const PAGE_TITLES: Record<string, string> = {
  [routePaths.admin]: 'Panel',
  [routePaths.adminModeration]: 'Moderación',
  [routePaths.adminStores]: 'Tiendas',
  [routePaths.adminEarnings]: 'Ganancias',
  [routePaths.adminUsers]: 'Usuarios',
  [routePaths.adminCategories]: 'Categorías',
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith(routePaths.adminModeration)) return 'Moderación';
  if (pathname.startsWith(routePaths.adminStores)) return 'Tiendas';
  if (pathname.startsWith(routePaths.adminEarnings)) return 'Ganancias';
  if (pathname.startsWith(routePaths.adminUsers)) return 'Usuarios';
  if (pathname.startsWith(routePaths.adminCategories)) return 'Categorías';
  return 'Panel';
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

  const pageTitle = getPageTitle(pathname);
  const displayName = getDisplayName(user);
  const initials = getInitials(displayName);

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
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-[var(--admin-border)] bg-white/70 px-6 backdrop-blur-md dark:bg-night-950/70">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {pageTitle}
      </h1>

      <div className="flex items-center gap-2">
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
                className="absolute right-0 top-[calc(100%+0.5rem)] w-80 rounded-xl border border-zinc-200/80 bg-white p-0 shadow-lg ring-1 ring-black/5 dark:border-night-700 dark:bg-admin-dropdown dark:ring-white/5"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-night-700">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Notificaciones
                  </p>
                  {pendingCount > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-admin-primary px-1 text-[10px] font-bold leading-none tabular-nums text-white">
                      {pendingCount}
                    </span>
                  )}
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      navigate(routePaths.adminModeration);
                    }}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-night-800"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                      <FiShield className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Tiendas pendientes de aprobación
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {pendingCount} {pendingCount === 1 ? 'tienda espera' : 'tiendas esperan'} revisión
                      </p>
                    </div>
                  </button>
                </div>
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
            className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-night-800"
            aria-expanded={userOpen}
            aria-label="Menú de usuario"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--admin-primary-soft)] text-xs font-semibold text-admin-primary">
              {initials}
            </div>
            <span className="hidden text-sm font-medium text-zinc-700 sm:block dark:text-zinc-200">
              {displayName}
            </span>
          </button>

          {userOpen && (
            <div
              role="dialog"
              className="absolute right-0 top-[calc(100%+0.5rem)] w-72 rounded-xl border border-zinc-200/80 bg-white p-0 shadow-lg ring-1 ring-black/5 dark:border-night-700 dark:bg-admin-dropdown dark:ring-white/5"
            >
              <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 dark:border-night-700">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--admin-primary-soft)] text-sm font-semibold text-admin-primary">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {user?.email ?? ''}
                  </p>
                </div>
              </div>

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

                <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200">
                  {theme === 'dark' ? (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-zinc-400">
                      <span className="inline-block h-3.5 w-3.5 rounded-full bg-zinc-300 dark:bg-night-600" />
                    </span>
                  ) : (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-zinc-400">
                      <span className="inline-block h-3.5 w-3.5 rounded-full bg-amber-400" />
                    </span>
                  )}
                  <span className="flex-1">Modo oscuro</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={theme === 'dark'}
                    onClick={toggleTheme}
                    className={`relative flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-night-900 ${
                      theme === 'dark'
                        ? 'bg-admin-primary'
                        : 'bg-zinc-200 dark:bg-night-700'
                    }`}
                  >
                    <span
                      className={`h-3 w-3 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 ease-out dark:ring-white/10 ${
                        theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
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
    </header>
  );
}
