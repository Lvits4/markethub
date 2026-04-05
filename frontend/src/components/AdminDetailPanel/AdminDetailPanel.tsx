import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';

import type { AdminStoreDetail, AdminStoreDetailStats } from '../../types/admin';

export function getAdminStorePanelStats(
  store: AdminStoreDetail,
): AdminStoreDetailStats {
  return (
    store.stats ?? {
      productsTotal: 0,
      productsActive: 0,
      ordersTotal: 0,
      ordersDelivered: 0,
      revenue: 0,
    }
  );
}

export function AdminDetailPanelRoot({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-4 py-3">
      {children}
    </div>
  );
}

export function AdminDetailPanelTop({ children }: { children: ReactNode }) {
  return <div className="shrink-0 space-y-3">{children}</div>;
}

export function AdminDetailTitleRow({
  title,
  subtitle,
  badges,
}: {
  title: string;
  subtitle?: ReactNode;
  badges: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0">
        <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        {subtitle != null ? (
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap justify-end gap-1">{badges}</div>
    </div>
  );
}

export function AdminDetailStatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="box-border w-full min-w-0 max-w-44 shrink-0 basis-37 grow-0 rounded-md border border-slate-200/80 bg-white px-2 py-1.5 shadow-sm sm:basis-39 dark:border-sky-500/20 dark:bg-admin-elevated">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="truncate text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
        {value}
      </p>
      {hint ? (
        <p className="truncate text-[9px] leading-tight text-slate-500 dark:text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function AdminDetailStatsGrid({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">{children}</div>
  );
}

export function AdminDetailHeroSplit({
  image,
  fields,
}: {
  image: ReactNode;
  fields: ReactNode;
}) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 border-t border-slate-200/80 pt-2 sm:grid-cols-[40%_1fr] sm:gap-5 dark:border-sky-500/20">
      <div className="flex min-h-30 min-w-0 items-center justify-center sm:min-h-32">
        {image}
      </div>
      <div className="min-w-0">{fields}</div>
    </div>
  );
}

export function AdminDetailImageFrame({
  children,
  ariaLabel,
}: {
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <div
      className="flex h-30 w-30 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50/90 p-2 ring-1 ring-slate-200/60 dark:border-sky-500/20 dark:bg-admin-media-bg dark:ring-sky-500/20 sm:h-32 sm:w-32"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

export function AdminDetailFieldsGrid({ children }: { children: ReactNode }) {
  return (
    <div className="inline-grid w-full max-w-full grid-cols-1 gap-y-1.5 justify-items-start sm:grid-cols-2 sm:gap-x-5 sm:gap-y-1.5">
      {children}
    </div>
  );
}

export function AdminDetailCompactField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: IconType;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="flex min-w-0 items-center gap-1 text-[11px] text-slate-800 dark:text-slate-200">
        {Icon ? (
          <Icon className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
        ) : null}
        <span className="min-w-0 truncate">{children}</span>
      </p>
    </div>
  );
}

export function AdminDetailCompactFieldBlock({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: IconType;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 sm:col-span-2">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <div className="mt-1 flex gap-1 text-[11px] leading-snug text-slate-800 dark:text-slate-200">
        {Icon ? (
          <Icon
            className="mt-0.5 h-3 w-3 shrink-0 text-slate-400"
            aria-hidden
          />
        ) : null}
        <div className="min-w-0 wrap-break-words">{children}</div>
      </div>
    </div>
  );
}

export function AdminDetailScrollSection({
  tablistLabel,
  tabs,
  activeTab,
  onTabChange,
  children,
}: {
  tablistLabel: string;
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <section className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden border-t border-slate-200/80 pt-3 dark:border-sky-500/20">
      <div
        className="inline-flex shrink-0 rounded-lg bg-slate-100 p-0.5 dark:bg-admin-elevated"
        role="tablist"
        aria-label={tablistLabel}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => onTabChange(t.id)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === t.id
                ? 'bg-white text-slate-800 shadow-sm dark:bg-admin-pill-dark dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="market-scroll mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5">
        {children}
      </div>
    </section>
  );
}

export function AdminDetailTextCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-3 dark:border-sky-500/20 dark:bg-admin-elevated">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <div className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        {children}
      </div>
    </div>
  );
}
