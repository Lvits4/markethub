import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-surface-cream)] px-4 py-10 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800">
        <Outlet />
      </div>
    </div>
  );
}
