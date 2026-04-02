import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FiPlus } from 'react-icons/fi';
import { FormSelect } from '../../components/CreateProductForm/FormSelect';
import { routePaths } from '../../config/routes';
import { formatPrice } from '../../helpers/formatPrice';
import { useAuth } from '../../hooks/useAuth';
import { useAdminDashboardQuery } from '../../queries/useAdminDashboardQuery';
import { useAdminSalesReportQuery } from '../../queries/useAdminSalesReportQuery';
import { useSellerDashboardQuery } from '../../queries/useSellerDashboardQuery';
import { useSellerSalesReportQuery } from '../../queries/useSellerSalesReportQuery';

const CHART_PERIOD_FORM_OPTIONS = [
  { value: '3', label: '3 meses' },
  { value: '6', label: '6 meses' },
  { value: '12', label: '12 meses' },
] as const;

const KPI_VARIANTS = [
  {
    shell:
      'border-blue-200/80 bg-linear-to-br from-blue-50/90 via-white/70 to-sky-100/50 shadow-[0_8px_30px_-10px_rgb(37_99_235_/_0.2)] dark:border-sky-500/25 dark:from-blue-950/55 dark:via-night-900/30 dark:to-sky-950/25 dark:shadow-[0_12px_40px_-12px_rgb(14_165_233_/_0.15)]',
    glow: 'bg-sky-400/35 dark:bg-sky-400/25',
    glowPos: '-right-10 -top-10 h-28 w-28',
    label: 'text-blue-800/80 dark:text-sky-200/90',
    value: 'text-blue-950 dark:text-sky-50',
  },
  {
    shell:
      'border-indigo-200/80 bg-linear-to-br from-indigo-50/90 via-white/70 to-blue-100/45 shadow-[0_8px_30px_-10px_rgb(79_70_229_/_0.18)] dark:border-indigo-400/30 dark:from-indigo-950/50 dark:via-night-900/35 dark:to-blue-950/30 dark:shadow-[0_12px_40px_-12px_rgb(99_102_241_/_0.2)]',
    glow: 'bg-indigo-400/30 dark:bg-indigo-400/22',
    glowPos: '-left-8 -bottom-10 h-32 w-32',
    label: 'text-indigo-900/75 dark:text-indigo-200/85',
    value: 'text-indigo-950 dark:text-indigo-50',
  },
  {
    shell:
      'border-sky-200/85 bg-linear-to-br from-sky-50/95 via-white/65 to-blue-50/55 shadow-[0_8px_30px_-10px_rgb(14_165_233_/_0.18)] dark:border-blue-400/28 dark:from-sky-950/45 dark:via-night-900/40 dark:to-blue-900/35 dark:shadow-[0_12px_40px_-12px_rgb(59_130_246_/_0.18)]',
    glow: 'bg-blue-400/28 dark:bg-blue-400/20',
    glowPos: 'right-4 -top-14 h-24 w-36',
    label: 'text-sky-900/80 dark:text-blue-200/88',
    value: 'text-sky-950 dark:text-blue-50',
  },
  {
    shell:
      'border-cyan-200/75 bg-linear-to-br from-cyan-50/85 via-white/72 to-blue-50/50 shadow-[0_8px_30px_-10px_rgb(6_182_212_/_0.16)] dark:border-cyan-500/22 dark:from-cyan-950/40 dark:via-night-900/38 dark:to-blue-950/28 dark:shadow-[0_12px_40px_-12px_rgb(34_211_238_/_0.12)]',
    glow: 'bg-cyan-400/25 dark:bg-cyan-400/18',
    glowPos: '-right-6 bottom-0 h-24 w-24',
    label: 'text-cyan-900/78 dark:text-cyan-200/85',
    value: 'text-cyan-950 dark:text-cyan-50',
  },
  {
    shell:
      'border-violet-200/80 bg-linear-to-br from-violet-50/90 via-white/70 to-fuchsia-50/45 shadow-[0_8px_30px_-10px_rgb(139_92_246_/_0.16)] dark:border-violet-400/28 dark:from-violet-950/45 dark:via-night-900/38 dark:to-fuchsia-950/25 dark:shadow-[0_12px_40px_-12px_rgb(167_139_250_/_0.15)]',
    glow: 'bg-violet-400/28 dark:bg-violet-400/18',
    glowPos: '-left-10 top-2 h-28 w-28',
    label: 'text-violet-900/78 dark:text-violet-200/88',
    value: 'text-violet-950 dark:text-violet-50',
  },
  {
    shell:
      'border-blue-200/75 bg-linear-to-br from-slate-50/90 via-blue-50/50 to-indigo-50/40 shadow-[0_8px_30px_-10px_rgb(30_58_138_/_0.14)] dark:border-slate-500/25 dark:from-slate-900/50 dark:via-night-900/35 dark:to-indigo-950/30 dark:shadow-[0_12px_40px_-12px_rgb(99_102_241_/_0.12)]',
    glow: 'bg-indigo-300/22 dark:bg-indigo-500/15',
    glowPos: 'right-0 -bottom-8 h-28 w-28',
    label: 'text-slate-700 dark:text-slate-300',
    value: 'text-slate-900 dark:text-slate-50',
  },
] as const;

function KpiCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: string | number;
  variant: 0 | 1 | 2 | 3 | 4 | 5;
}) {
  const v = KPI_VARIANTS[variant];
  return (
    <div
      className={`relative isolate h-full min-w-0 w-full overflow-hidden rounded-md border px-2 py-2.5 backdrop-blur-xl backdrop-saturate-150 sm:px-2.5 sm:py-3 ${v.shell}`}
    >
      <div
        className={`pointer-events-none absolute rounded-md blur-2xl ${v.glowPos} ${v.glow}`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-white/25 to-transparent dark:from-night-950/20 dark:to-transparent"
        aria-hidden
      />
      <div className="relative">
        <p
          className={`line-clamp-2 min-h-[2.25rem] text-[9px] font-semibold uppercase leading-snug tracking-wide sm:text-[10px] ${v.label}`}
        >
          {label}
        </p>
        <p
          className={`mt-0.5 text-base font-bold tabular-nums tracking-tight sm:mt-1 sm:text-lg lg:text-xl ${v.value}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function truncateLabel(name: string, max = 14) {
  const t = name.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function AdminDashboardPage() {
  const { user } = useAuth();
  const isSeller = user?.role === 'SELLER';
  const adminDashboard = useAdminDashboardQuery();
  const sellerDashboard = useSellerDashboardQuery();
  const data = isSeller ? sellerDashboard.data : adminDashboard.data;
  const isLoading = isSeller
    ? sellerDashboard.isLoading
    : adminDashboard.isLoading;
  const isError = isSeller ? sellerDashboard.isError : adminDashboard.isError;

  const adminSales = useAdminSalesReportQuery();
  const sellerSales = useSellerSalesReportQuery();
  const sales = isSeller ? sellerSales : adminSales;
  const [periodMonths, setPeriodMonths] = useState<3 | 6 | 12>(6);

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

  const topStoresChart = useMemo(() => {
    const rows = sales.data?.topStores ?? [];
    return rows.slice(0, 6).map((r) => ({
      nombre: truncateLabel(r.storeName, 16),
      nombreCompleto: r.storeName,
      ingresos: Number.parseFloat(String(r.totalRevenue)) || 0,
    }));
  }, [sales.data]);

  const CHART_H = 168;

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
    <div className="flex min-h-0 flex-col gap-3">
      <header className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
            Panel
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
            {isSeller ? 'Resumen de tus tiendas' : 'Resumen de MarketHub'}
          </p>
        </div>
      </header>

      <div className="flex min-w-0 flex-nowrap items-stretch gap-2 overflow-x-auto pb-0.5 md:gap-2.5">
        {isSeller ? (
          <>
            <div className="min-w-[4.25rem] shrink-0 grow basis-0 md:min-w-0 md:shrink">
              <KpiCard
                variant={0}
                label="Ingresos"
                value={formatPrice(data.revenue.totalSales)}
              />
            </div>
            <div className="min-w-[4.25rem] shrink-0 grow basis-0 md:min-w-0 md:shrink">
              <KpiCard
                variant={1}
                label="Productos activos"
                value={data.products.active}
              />
            </div>
            <div className="min-w-[4.25rem] shrink-0 grow basis-0 md:min-w-0 md:shrink">
              <KpiCard
                variant={2}
                label="Mis tiendas"
                value={data.stores.total}
              />
            </div>
            <div className="min-w-[4.25rem] shrink-0 grow basis-0 md:min-w-0 md:shrink">
              <KpiCard
                variant={3}
                label="Aprobadas"
                value={data.stores.approved}
              />
            </div>
            <div className="min-w-[4.25rem] shrink-0 grow basis-0 md:min-w-0 md:shrink">
              <KpiCard variant={4} label="Órdenes" value={data.orders.total} />
            </div>
            <div className="min-w-[4.25rem] shrink-0 grow basis-0 md:min-w-0 md:shrink">
              <KpiCard
                variant={5}
                label="Completadas"
                value={data.orders.completed}
              />
            </div>
          </>
        ) : (
          <>
            <div className="min-w-[4.25rem] shrink-0 grow basis-0 md:min-w-0 md:shrink">
              <KpiCard variant={0} label="Vendedores" value={data.users.sellers} />
            </div>
            <div className="min-w-[4.25rem] shrink-0 grow basis-0 md:min-w-0 md:shrink">
              <KpiCard variant={1} label="Clientes" value={data.users.customers} />
            </div>
            <div className="min-w-[4.25rem] shrink-0 grow basis-0 md:min-w-0 md:shrink">
              <KpiCard
                variant={2}
                label="Tiendas aprobadas"
                value={data.stores.approved}
              />
            </div>
            <div className="min-w-[4.25rem] shrink-0 grow basis-0 md:min-w-0 md:shrink">
              <KpiCard
                variant={3}
                label="Tiendas rechazadas"
                value={data.stores.rejected}
              />
            </div>
            <div className="min-w-[4.25rem] shrink-0 grow basis-0 md:min-w-0 md:shrink">
              <KpiCard variant={4} label="Órdenes" value={data.orders.total} />
            </div>
            <div className="min-w-[4.25rem] shrink-0 grow basis-0 md:min-w-0 md:shrink">
              <KpiCard variant={5} label="Productos" value={data.products.total} />
            </div>
          </>
        )}
        <NavLink
          to={routePaths.adminSales}
          className="flex min-h-[76px] min-w-[4.25rem] shrink-0 grow basis-0 flex-col items-center justify-center gap-0.5 rounded-md border-2 border-dashed border-blue-300/80 bg-blue-50/30 px-1 py-1.5 text-center backdrop-blur-md transition-colors hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-soft)] md:min-w-0 md:shrink dark:border-blue-500/35 dark:bg-blue-950/25 dark:hover:bg-blue-950/40"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100/90 text-blue-600 shadow-sm dark:bg-blue-500/15 dark:text-blue-300">
            <FiPlus className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="line-clamp-2 text-[8px] font-semibold uppercase leading-tight tracking-wide text-blue-900/85 sm:text-[9px] dark:text-blue-200/90">
            Informes
          </span>
        </NavLink>
      </div>

      <div className="grid min-h-0 shrink-0 grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="flex min-h-0 flex-col rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] p-3 shadow-sm dark:shadow-none">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2
                id="chart-monthly-title"
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
              >
                Ingresos por mes
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Barras: importe · línea: pedidos
              </p>
            </div>
            <FormSelect
              id="admin-chart-period"
              variant="compact"
              aria-labelledby="chart-monthly-title"
              value={String(periodMonths)}
              onChange={(v) => {
                const n = Number(v);
                if (n === 3 || n === 6 || n === 12) {
                  setPeriodMonths(n);
                }
              }}
              options={[...CHART_PERIOD_FORM_OPTIONS]}
            />
          </div>
          <div
            className="w-full min-w-0"
            style={{ height: CHART_H }}
            role="img"
            aria-label="Gráfico de ingresos y pedidos por mes"
          >
            {chartBars.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartBars}
                  margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgb(0 0 0 / 0.06)"
                    className="dark:stroke-night-700"
                  />
                  <XAxis
                    dataKey="mesCorto"
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                    }
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      name === 'ingresos'
                        ? [formatPrice(value), 'Ingresos']
                        : [value, 'Pedidos']
                    }
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload as { mes?: string } | undefined;
                      return row?.mes ?? '';
                    }}
                    contentStyle={{
                      borderRadius: 6,
                      border: '1px solid rgb(0 0 0 / 0.08)',
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="ingresos"
                    name="ingresos"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="pedidos"
                    name="pedidos"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                Sin datos mensuales
              </div>
            )}
          </div>
        </section>

        <section className="flex min-h-0 flex-col rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] p-3 shadow-sm dark:shadow-none">
          <div className="mb-2 min-w-0">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Top tiendas por ingresos
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Hasta 6 tiendas con más ventas (sin cancelados)
            </p>
          </div>
          <div
            className="w-full min-w-0"
            style={{ height: CHART_H }}
            role="img"
            aria-label="Gráfico horizontal de ingresos por tienda"
          >
            {topStoresChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topStoresChart}
                  margin={{ top: 2, right: 8, left: 4, bottom: 2 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="rgb(0 0 0 / 0.06)"
                    className="dark:stroke-night-700"
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="nombre"
                    width={92}
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => formatPrice(value)}
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload as
                        | { nombreCompleto?: string }
                        | undefined;
                      return row?.nombreCompleto ?? '';
                    }}
                    contentStyle={{
                      borderRadius: 6,
                      border: '1px solid rgb(0 0 0 / 0.08)',
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="ingresos"
                    name="Ingresos"
                    fill="var(--admin-primary, #2563eb)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={14}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                Sin datos de tiendas
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
