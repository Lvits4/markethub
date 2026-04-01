import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthHero } from '../../components/AuthHero/AuthHero';
import { ThemeToggle } from '../../components/ThemeToggle/ThemeToggle';

/**
 * Shell de rutas bajo `/auth`: hero + panel con Outlet (login, registro, etc.).
 * Diseño responsive: banner en móvil/tablet, columna + formulario en desktop.
 */
export function AuthPage() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-1 flex min-h-0 items-center justify-center overflow-hidden overscroll-none bg-linear-to-br from-[#e6eaf3] via-auth-bg to-[#dce3ef] px-3 pb-4 pt-6 sm:px-5 sm:pb-6 sm:pt-8 md:pb-8 md:pt-10 dark:from-night-950 dark:via-night-900 dark:to-night-800">
      <div className="pointer-events-auto absolute right-3 top-4 z-10 sm:right-5 sm:top-6 md:right-6 md:top-8">
        <ThemeToggle className="shadow-md" />
      </div>
      <div className="flex max-h-[calc(100dvh-2.75rem)] w-full max-w-4xl min-h-0 flex-col overflow-x-hidden overflow-y-auto rounded-lg bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.12)] ring-1 ring-zinc-900/5 dark:bg-night-900 dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.45)] dark:ring-white/6 sm:max-h-[calc(100dvh-3.25rem)] sm:rounded-md md:max-h-[calc(100dvh-4.5rem)] lg:flex-row">
        <div className="shrink-0 lg:hidden">
          <AuthHero variant="banner" />
        </div>
        <div className="relative hidden min-h-0 min-w-0 basis-0 self-stretch lg:block lg:flex-1">
          <AuthHero variant="split" />
        </div>
        <div className="relative flex min-h-0 min-w-0 basis-0 flex-col overflow-hidden bg-white px-4 pb-4 pt-5 sm:px-8 sm:pb-7 sm:pt-8 dark:bg-night-900 lg:flex-1 lg:justify-center lg:px-10 lg:pb-8 lg:pt-9">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.06),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)]"
            aria-hidden
          />
          <div className="relative flex w-full min-w-0 flex-col items-center">
            <div className="w-full max-w-sm min-w-0">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
