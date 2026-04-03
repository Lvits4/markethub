import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FormSelect } from '../../components/CreateProductForm/FormSelect';
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

/** Acento discreto por tarjeta (misma base que el resto del admin). */
const KPI_ACCENT_LEFT = [
  'border-l-blue-500 dark:border-l-blue-400',
  'border-l-indigo-500 dark:border-l-indigo-400',
  'border-l-sky-500 dark:border-l-sky-400',
  'border-l-cyan-500 dark:border-l-cyan-400',
  'border-l-violet-500 dark:border-l-violet-400',
  'border-l-zinc-400 dark:border-l-zinc-500',
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
  const accent = KPI_ACCENT_LEFT[variant];
  return (
    <div
      className={`flex h-full min-h-[5.75rem] min-w-0 w-full flex-col justify-center rounded-md border border-[var(--admin-border)] border-l-4 bg-[var(--admin-card)] px-4 py-3.5 shadow-sm dark:shadow-none sm:min-h-[6.25rem] sm:px-4 sm:py-4 ${accent}`}
    >
      <p className="line-clamp-2 text-xs font-medium leading-snug text-zinc-600 dark:text-zinc-400 sm:text-[13px]">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 sm:mt-2 sm:text-3xl">
        {value}
      </p>
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
    <div className="flex min-h-0 flex-1 flex-col gap-3">
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

      <div className="grid shrink-0 grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {isSeller ? (
          <>
            <div className="min-w-0">
              <KpiCard
                variant={0}
                label="Ingresos"
                value={formatPrice(data.revenue.totalSales)}
              />
            </div>
            <div className="min-w-0">
              <KpiCard
                variant={1}
                label="Productos activos"
                value={data.products.active}
              />
            </div>
            <div className="min-w-0">
              <KpiCard
                variant={2}
                label="Mis tiendas"
                value={data.stores.total}
              />
            </div>
            <div className="min-w-0">
              <KpiCard
                variant={3}
                label="Aprobadas"
                value={data.stores.approved}
              />
            </div>
            <div className="min-w-0">
              <KpiCard variant={4} label="Órdenes" value={data.orders.total} />
            </div>
            <div className="min-w-0">
              <KpiCard
                variant={5}
                label="Completadas"
                value={data.orders.completed}
              />
            </div>
          </>
        ) : (
          <>
            <div className="min-w-0">
              <KpiCard variant={0} label="Vendedores" value={data.users.sellers} />
            </div>
            <div className="min-w-0">
              <KpiCard variant={1} label="Clientes" value={data.users.customers} />
            </div>
            <div className="min-w-0">
              <KpiCard
                variant={2}
                label="Tiendas aprobadas"
                value={data.stores.approved}
              />
            </div>
            <div className="min-w-0">
              <KpiCard
                variant={3}
                label="Tiendas rechazadas"
                value={data.stores.rejected}
              />
            </div>
            <div className="min-w-0">
              <KpiCard variant={4} label="Órdenes" value={data.orders.total} />
            </div>
            <div className="min-w-0">
              <KpiCard variant={5} label="Productos" value={data.products.total} />
            </div>
          </>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-none lg:flex-row lg:items-stretch">
        <section className="flex max-lg:min-h-[260px] flex-1 flex-col rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] p-3 shadow-sm dark:shadow-none lg:min-h-0 lg:min-w-0">
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
            className="flex min-h-[200px] w-full min-w-0 flex-1 lg:h-[300px] lg:min-h-[300px] lg:flex-none"
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
                    cursor={false}
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

        <section className="flex max-lg:min-h-[260px] flex-1 flex-col rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] p-3 shadow-sm dark:shadow-none lg:min-h-0 lg:min-w-0">
          <div className="mb-2 min-w-0">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Top tiendas por ingresos
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Hasta 6 tiendas con más ventas (sin cancelados)
            </p>
          </div>
          <div
            className="flex min-h-[200px] w-full min-w-0 flex-1 lg:h-[300px] lg:min-h-[300px] lg:flex-none"
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
                    cursor={false}
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
