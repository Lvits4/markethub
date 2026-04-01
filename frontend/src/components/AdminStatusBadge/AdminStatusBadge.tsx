import type { ReactNode } from 'react';

export type AdminStatusBadgeTone =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'blue'
  | 'neutral';

const TONE_CLASSES: Record<AdminStatusBadgeTone, string> = {
  success:
    'bg-emerald-50 text-emerald-700 ring-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/25',
  danger:
    'bg-rose-50 text-rose-700 ring-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25',
  warning:
    'bg-amber-50 text-amber-700 ring-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/25',
  info: 'bg-sky-50 text-sky-700 ring-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/25',
  blue: 'bg-blue-50 text-blue-700 ring-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/25',
  neutral:
    'bg-slate-100 text-slate-700 ring-slate-400/20 dark:bg-slate-500/15 dark:text-slate-200 dark:ring-slate-400/25',
};

type AdminStatusBadgeProps = {
  children: ReactNode;
  tone: AdminStatusBadgeTone;
  className?: string;
};

export function AdminStatusBadge({
  children,
  tone,
  className = '',
}: AdminStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none ring-1 ring-inset ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Misma semántica que el antiguo `statusChipClass` de pedidos admin. */
export function orderStatusTone(status: string): AdminStatusBadgeTone {
  switch (status) {
    case 'DELIVERED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    case 'SHIPPED':
      return 'info';
    case 'CONFIRMED':
      return 'blue';
    default:
      return 'warning';
  }
}
