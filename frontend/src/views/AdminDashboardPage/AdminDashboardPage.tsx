import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FiChevronDown, FiPlus } from 'react-icons/fi';
import { routePaths } from '../../config/routes';
import { formatPrice } from '../../helpers/formatPrice';
import { useAdminDashboardQuery } from '../../queries/useAdminDashboardQuery';
import { useAdminPlatformReportQuery } from '../../queries/useAdminPlatformReportQuery';
import { useAdminSalesReportQuery } from '../../queries/useAdminSalesReportQuery';

const DONUT_COLORS = [
  '#27ae60',
  '#3b82f6',
  '#f97316',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#64748b',
];

const PERIOD_OPTIONS: { value: 3 | 6 | 12; label: string }[] = [
  { value: 3, label: 'Últimos 3 meses' },
  { value: 6, label: 'Últimos 6 meses' },
  { value: 12, label: 'Últimos 12 meses' },
];

function ChartPeriodSelect({
  value,
  onChange,
  labelledBy,
}: {
  value: 3 | 6 | 12;
  onChange: (v: 3 | 6 | 12) => void;
  labelledBy: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected =
    PERIOD_OPTIONS.find((o) => o.value === value) ?? PERIOD_OPTIONS[2];

  return (
    <div className="relative w-full sm:w-auto" ref={wrapRef}>
      <button
        type="button"
        id="admin-period-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelledBy}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full min-w-[min(100%,220px)] sm:min-w-[220px] items-center justify-between gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-2 text-left text-sm font-medium text-zinc-800 shadow-sm outline-none ring-[var(--admin-primary)]/0 transition hover:border-zinc-300 focus-visible:ring-2 dark:text-zinc-100 dark:hover:border-zinc-600"
      >
        <span className="truncate">{selected.label}</span>
        <FiChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] py-0.5 shadow-lg ring-1 ring-black/5 dark:ring-white/10 sm:left-auto sm:right-0 sm:min-w-[220px]"
        >
          {PERIOD_OPTIONS.map((opt) => (
            <li key={opt.value} role="presentation">
              <button
                type="button"
                id={`period-opt-${opt.value}`}
                role="option"
                aria-selected={opt.value === value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={
                  opt.value === value
                    ? 'w-full px-4 py-2 text-left text-sm font-semibold text-[var(--admin-primary)] bg-[var(--admin-primary-soft)] dark:text-emerald-400'
                    : 'w-full px-4 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/80'
                }
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-2.5 shadow-sm dark:shadow-none">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data, isLoading, isError } = useAdminDashboardQuery();
  const sales = useAdminSalesReportQuery();
  const platform = useAdminPlatformReportQuery();
  const [periodMonths, setPeriodMonths] = useState<3 | 6 | 12>(12);

  const monthlyChrono = useMemo(() => {
    const raw = [...(sales.data?.monthlySales ?? [])];
    return raw.reverse();
  }, [sales.data]);

  const chartBars = useMemo(() => {
    const slice = monthlyChrono.slice(-periodMonths);
    return slice.map((row) => ({
      mes: row.month,
      mesCorto: row.month.replace(/^(\d{4})-(\d{2})$/, '$2/$1'),
      ingresos: Number.parseFloat(String(row.totalRevenue)) || 0,
      pedidos: Number.parseInt(String(row.totalOrders), 10) || 0,
    }));
  }, [monthlyChrono, periodMonths]);

  const donutData = useMemo(() => {
    const rows = platform.data?.productSales ?? [];
    if (!rows.length) return [];
    const sorted = [...rows].sort((a, b) => b.revenue - a.revenue);
    const top = sorted.slice(0, 6);
    const sumTop = top.reduce((s, r) => s + r.revenue, 0);
    const sumAll = sorted.reduce((s, r) => s + r.revenue, 0);
    const other = Math.max(0, sumAll - sumTop);
    const data = top.map((r) => ({ name: r.name, value: r.revenue }));
    if (other > 0) data.push({ name: 'Otros', value: other });
    return data;
  }, [platform.data]);

  const storeShare = useMemo(() => {
    const rows = sales.data?.topStores ?? [];
    const total = rows.reduce(
      (s, r) => s + (Number.parseFloat(String(r.totalRevenue)) || 0),
      0,
    );
    return rows.map((r) => {
      const rev = Number.parseFloat(String(r.totalRevenue)) || 0;
      return {
        id: r.storeId,
        name: r.storeName,
        pct: total > 0 ? (rev / total) * 100 : 0,
        revenue: rev,
      };
    });
  }, [sales.data]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-500">Cargando panel…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-center text-sm text-red-600">
        No se pudieron cargar los datos del panel.
      </p>
    );
  }

  return (
    <div>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 shrink">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Panel
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Resumen de MarketHub
          </p>
        </div>
        <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:max-w-md sm:items-stretch">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <span
              id="admin-period-label"
              className="shrink-0 text-sm font-medium leading-none text-zinc-600 dark:text-zinc-400"
            >
              Periodo gráficos
            </span>
            <ChartPeriodSelect
              labelledBy="admin-period-label"
              value={periodMonths}
              onChange={setPeriodMonths}
            />
          </div>
        </div>
      </header>

      <div className="mt-5 grid items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Clientes" value={data.users.customers} />
        <KpiCard
          label="Ingresos cobrados"
          value={formatPrice(data.revenue.totalSales)}
        />
        <KpiCard label="Pedidos" value={data.orders.total} />
        <KpiCard label="Tiendas pendientes" value={data.stores.pending} />
        <NavLink
          to={routePaths.adminSales}
          className="flex flex-col items-center justify-center gap-1 self-stretch rounded-2xl border-2 border-dashed border-zinc-300 bg-transparent px-3 py-2.5 text-center transition-colors hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-soft)] dark:border-zinc-600"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <FiPlus className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
            Informes detallados
          </span>
        </NavLink>
      </div>

      <section className="mt-5 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 shadow-sm dark:shadow-none">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Ventas por mes
        </h2>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          Ingresos (USD) y volumen de pedidos por mes
        </p>
        <div className="mt-4 h-[280px] w-full min-w-0">
          {chartBars.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartBars}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgb(0 0 0 / 0.06)"
                  className="dark:stroke-zinc-700"
                />
                <XAxis
                  dataKey="mesCorto"
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                  }
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === 'ingresos'
                      ? [formatPrice(value), 'Ingresos']
                      : [value, 'Pedidos']
                  }
                  labelFormatter={(label, payload) => {
                    const row = payload?.[0]?.payload as
                      | { mes?: string }
                      | undefined;
                    return row?.mes ?? String(label);
                  }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgb(0 0 0 / 0.08)',
                    boxShadow: '0 12px 40px -12px rgb(0 0 0 / 0.2)',
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="ingresos"
                  name="Ingresos"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  yAxisId="right"
                  dataKey="pedidos"
                  name="Pedidos"
                  fill="#f97316"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              Sin datos mensuales todavía
            </div>
          )}
        </div>
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 shadow-sm dark:shadow-none">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Ingresos por producto
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Participación según pedidos de la plataforma
          </p>
          <div className="mt-3 flex flex-col items-center gap-3 lg:flex-row lg:items-center">
            <div className="h-[236px] w-full max-w-[280px]">
              {donutData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {donutData.map((_, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatPrice(value)}
                      contentStyle={{ borderRadius: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                  Sin ventas por producto
                </div>
              )}
            </div>
            {donutData.length > 0 ? (
              <ul className="w-full max-w-sm flex-1 space-y-1.5 text-sm">
                {donutData.map((d, i) => {
                  const total = donutData.reduce((s, x) => s + x.value, 0);
                  const pct = total ? (d.value / total) * 100 : 0;
                  return (
                    <li key={d.name} className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length],
                        }}
                      />
                      <span className="min-w-0 flex-1 truncate text-zinc-700 dark:text-zinc-300">
                        {d.name}
                      </span>
                      <span className="shrink-0 tabular-nums text-zinc-500">
                        {pct.toFixed(0)}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 shadow-sm dark:shadow-none">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Ventas por tienda
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Reparto de ingresos entre las tiendas con más actividad
          </p>
          <div className="mt-3 space-y-3">
            {storeShare.length > 0 ? (
              storeShare.slice(0, 8).map((s) => (
                <div key={s.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                      {s.name}
                    </span>
                    <span className="shrink-0 tabular-nums text-zinc-500">
                      {s.pct.toFixed(0)}% · {formatPrice(s.revenue)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-[var(--admin-primary)] transition-all"
                      style={{ width: `${Math.min(100, s.pct)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">Sin datos de tiendas aún</p>
            )}
          </div>
          <div className="mt-4 rounded-xl bg-[var(--admin-primary-soft)] p-3 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-primary)]">
              Mapa / regiones
            </p>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              Cuando tengas datos por país o región, podrás enlazarlos aquí. Por
              ahora el reparto por tienda sustituye esa vista.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
