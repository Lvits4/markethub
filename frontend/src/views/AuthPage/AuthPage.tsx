import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthBrand } from '../../components/AuthBrand/AuthBrand';
import { AuthHero } from '../../components/AuthHero/AuthHero';
import { ThemeToggle } from '../../components/ThemeToggle/ThemeToggle';

/**
 * Shell de rutas bajo `/auth`: hero en desktop + panel con Outlet (login, registro, etc.).
 * Por debajo de lg: la tarjeta crece con el contenido y el scroll va al viewport (no dentro del panel).
 * Desde lg: hero + formulario; si hace falta scroll, en la tarjeta completa.
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
    <div className="fixed inset-0 z-1 flex min-h-0 justify-center overflow-x-hidden overscroll-none max-lg:overflow-y-auto max-lg:overscroll-y-contain lg:overflow-hidden bg-linear-to-br from-auth-screen-from via-auth-bg to-auth-screen-to px-3 pb-4 pt-6 sm:px-5 sm:pb-6 sm:pt-8 md:pb-8 md:pt-10 lg:items-center dark:from-night-950 dark:via-night-900 dark:to-night-800">
      <div className="flex w-full max-lg:min-h-dvh max-lg:items-center max-lg:justify-center lg:contents">
        <div className="flex min-h-0 flex-col overflow-x-hidden overflow-y-auto rounded-lg bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.12)] ring-1 ring-zinc-900/5 dark:bg-night-900 dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.45)] dark:ring-white/6 max-lg:h-auto max-lg:min-h-0 max-lg:w-max max-lg:max-w-[min(100%,calc(100vw-2rem))] max-lg:overflow-x-hidden max-lg:overflow-y-visible max-lg:shrink-0 sm:rounded-md lg:inline-flex lg:h-auto lg:w-max lg:max-h-[calc(100dvh-2rem)] lg:max-w-[min(56rem,calc(100vw-1.5rem))] lg:flex-row">
          <div className="relative hidden min-h-0 min-w-0 self-stretch lg:block lg:w-96 lg:flex-none lg:shrink-0">
            <AuthHero />
          </div>
          <div className="relative flex min-h-0 min-w-0 max-lg:flex-none max-lg:basis-auto flex-1 basis-0 flex-col max-lg:overflow-x-hidden max-lg:overflow-y-visible bg-white px-4 pb-4 pt-0 sm:px-8 sm:pb-5 dark:bg-night-900 max-lg:w-max max-lg:max-w-full max-lg:min-h-0 lg:min-h-min lg:w-116 lg:shrink-0 lg:overflow-x-hidden lg:overflow-y-visible lg:px-10 lg:pb-6 lg:pt-0 lg:flex-none">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.06),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)]"
              aria-hidden
            />
            <div className="relative z-10 flex w-full shrink-0 items-center justify-between gap-3 pt-4 sm:pt-5 lg:pt-6">
              <AuthBrand surface="light" className="min-w-0" />
              <ThemeToggle className="shrink-0 shadow-md" />
            </div>
            <div className="relative z-10 flex min-h-0 w-full min-w-0 max-lg:flex-none flex-1 flex-col overflow-y-visible max-lg:w-fit max-lg:self-center lg:w-full">
              <div className="flex w-full min-w-0 flex-col items-center max-lg:min-h-0 max-lg:justify-start py-4 sm:py-6 lg:min-h-full lg:justify-center lg:py-4">
                <div className="w-full max-w-sm min-w-0 max-lg:w-fit lg:w-full">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
