import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthBrand } from '../../components/AuthBrand/AuthBrand';
import { AuthHero } from '../../components/AuthHero/AuthHero';
import { ThemeToggle } from '../../components/ThemeToggle/ThemeToggle';

/**
 * Shell de rutas bajo `/auth`: hero en desktop + panel con Outlet (login, registro, etc.).
 * Por debajo de lg: tarjeta a altura útil del viewport y solo formulario centrado; desde lg: hero + formulario.
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
    <div className="fixed inset-0 z-1 flex min-h-0 justify-center overflow-hidden overscroll-none bg-linear-to-br from-[#e6eaf3] via-auth-bg to-[#dce3ef] px-3 pb-4 pt-6 max-lg:items-stretch sm:px-5 sm:pb-6 sm:pt-8 md:pb-8 md:pt-10 lg:items-center dark:from-night-950 dark:via-night-900 dark:to-night-800">
      <div className="flex min-h-0 flex-col overflow-x-hidden overflow-y-auto rounded-lg bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.12)] ring-1 ring-zinc-900/5 dark:bg-night-900 dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.45)] dark:ring-white/6 max-lg:h-full max-lg:min-h-0 max-lg:w-max max-lg:max-w-[min(100%,calc(100vw-2rem))] sm:rounded-md lg:inline-flex lg:h-auto lg:w-max lg:max-h-[calc(100dvh-4.5rem)] lg:max-w-[min(56rem,calc(100vw-1.5rem))] lg:flex-row">
        <div className="relative hidden min-h-0 min-w-0 self-stretch lg:block lg:w-96 lg:flex-none lg:shrink-0">
          <AuthHero variant="split" />
        </div>
        <div className="relative flex min-h-0 min-w-0 flex-1 basis-0 flex-col overflow-hidden bg-white px-4 pb-4 pt-0 sm:px-8 sm:pb-7 dark:bg-night-900 max-lg:w-max max-lg:max-w-full max-lg:min-h-0 lg:w-116 lg:shrink-0 lg:px-10 lg:pb-8 lg:pt-0 lg:flex-none">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.06),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)]"
            aria-hidden
          />
          <div className="relative z-10 flex w-full shrink-0 items-center justify-between gap-3 pt-4 sm:pt-5 lg:pt-9">
            <AuthBrand surface="light" className="min-w-0" />
            <ThemeToggle className="shrink-0 shadow-md" />
          </div>
          <div className="relative z-10 flex min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center pt-2 sm:pt-3 max-lg:w-fit max-lg:self-center lg:w-full">
            <div className="w-full max-w-sm min-w-0 max-lg:w-fit lg:w-full">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
