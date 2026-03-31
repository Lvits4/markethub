import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthHero } from '../../components/AuthHero/AuthHero';
import { ThemeToggle } from '../../components/ThemeToggle/ThemeToggle';

export function AuthLayout() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-1 flex items-center justify-center overflow-hidden overscroll-none bg-linear-to-br from-[#e6eaf3] via-auth-bg to-[#dce3ef] px-4 pb-6 pt-8 md:px-5 md:pb-8 md:pt-10 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <div className="pointer-events-auto absolute right-4 top-6 z-10 md:right-6 md:top-8">
        <ThemeToggle className="shadow-md" />
      </div>
      <div className="flex max-h-[calc(100dvh-3.5rem)] w-full max-w-4xl min-h-0 flex-col overflow-x-hidden overflow-y-auto rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.12)] ring-1 ring-zinc-900/5 dark:bg-zinc-900 dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.45)] dark:ring-white/6 md:max-h-[calc(100dvh-4.5rem)] lg:flex-row">
        <div className="shrink-0 lg:hidden">
          <AuthHero variant="banner" />
        </div>
        <div className="relative hidden min-h-0 min-w-0 basis-0 self-stretch lg:block lg:flex-1">
          <AuthHero variant="split" />
        </div>
        <div className="relative flex min-h-0 min-w-0 basis-0 flex-col overflow-hidden bg-white px-5 pb-5 pt-6 sm:px-8 sm:pb-7 sm:pt-8 dark:bg-zinc-900 lg:flex-1 lg:justify-center lg:px-10 lg:pb-8 lg:pt-9">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.06),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)]"
            aria-hidden
          />
          <div className="relative flex w-full flex-col items-center">
            <div className="w-full max-w-sm">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
