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
import {
  HiShoppingCart,
  HiCurrencyDollar,
  HiPercentBadge,
  HiCube,
  HiExclamationTriangle,
} from 'react-icons/hi2';
import { FormSelect } from '../../components/CreateProductForm/FormSelect';
import { formatPrice } from '../../helpers/formatPrice';
import { useSellerDashboardQuery } from '../../queries/useSellerDashboardQuery';

const LOW_STOCK_OPTIONS = [
  { value: '3', label: '3' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '15', label: '15' },
] as const;

const KPI_STYLES = [
  { accent: 'border-l-emerald-500 dark:border-l-emerald-400', icon: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { accent: 'border-l-blue-500 dark:border-l-blue-400', icon: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { accent: 'border-l-amber-500 dark:border-l-amber-400', icon: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { accent: 'border-l-indigo-500 dark:border-l-indigo-400', icon: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  { accent: 'border-l-rose-500 dark:border-l-rose-400', icon: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' },
] as const;

function KpiCard({
  label,
  value,
  icon,
  variant,
}: {
  label: React.ReactNode;
  value: string | number;
  icon: React.ReactNode;
  variant: 0 | 1 | 2 | 3 | 4;
}) {
  const style = KPI_STYLES[variant];
  return (
    <div
      className={`flex h-full min-h-[5.75rem] min-w-0 w-full items-center gap-3 rounded-md border border-[var(--admin-border)] border-l-4 bg-[var(--admin-card)] px-4 py-3.5 shadow-sm dark:shadow-none sm:min-h-[6.25rem] sm:px-4 sm:py-4 ${style.accent}`}
    >
      <div className={`shrink-0 ${style.icon}`}>
        {icon}
      </div>
      <div className="min-w-0 flex flex-col justify-center">
        <p className="line-clamp-2 text-xs font-medium leading-snug text-zinc-600 dark:text-zinc-400 sm:text-[13px]">
          {label}
        </p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 sm:mt-2 sm:text-3xl">
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

export function SellerDashboardPage() {
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('sellerLowStockThreshold');
    const n = saved ? Number(saved) : 5;
    return n === 3 || n === 5 || n === 10 || n === 15 ? n : 5;
  });

  const { data, isLoading, isError } = useSellerDashboardQuery(lowStockThreshold);

  const handleThresholdChange = (v: string) => {
    const n = Number(v);
    if (n === 3 || n === 5 || n === 10 || n === 15) {
      setLowStockThreshold(n);
      localStorage.setItem('sellerLowStockThreshold', String(n));
    }
  };

  const dailyOrdersChart = useMemo(() => {
    if (!data?.dailyOrders) return [];
    return data.dailyOrders.map((row) => ({
      day: row.day,
      dayLabel: row.day.slice(5),
      pedidos: Number.parseInt(String(row.orderCount), 10) || 0,
    }));
  }, [data]);

  const monthlySalesChart = useMemo(() => {
    if (!data?.monthlySales) return [];
    return [...data.monthlySales].reverse().map((row) => ({
      month: row.month,
      mesCorto: row.month.replace(/^(\d{4})-(\d{2})$/, '$2/$1'),
      ingresos: Number.parseFloat(String(row.totalRevenue)) || 0,
      pedidos: Number.parseInt(String(row.totalOrders), 10) || 0,
    }));
  }, [data]);

  const topStoresChart = useMemo(() => {
    if (!data?.topStoresByEarnings) return [];
    return data.topStoresByEarnings.slice(0, 6).map((row) => ({
      nombre: truncateLabel(row.storeName, 16),
      nombreCompleto: row.storeName,
      ganancia: row.sellerEarnings,
    }));
  }, [data]);

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
            Resumen de tus tiendas
          </p>
        </div>
      </header>

      <div className="grid shrink-0 grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5 xl:grid-cols-5">
        <div className="min-w-0">
          <KpiCard
            variant={0}
            label="Cantidad de ventas"
            value={data.salesCount}
            icon={<HiShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />}
          />
        </div>
        <div className="min-w-0">
          <KpiCard
            variant={1}
            label="Mis ganancias"
            value={formatPrice(data.sellerEarnings)}
            icon={<HiCurrencyDollar className="h-6 w-6 sm:h-7 sm:w-7" />}
          />
        </div>
        <div className="min-w-0">
          <KpiCard
            variant={2}
            label="Total comisión a pagar"
            value={formatPrice(data.commissionOwed)}
            icon={<HiPercentBadge className="h-6 w-6 sm:h-7 sm:w-7" />}
          />
        </div>
        <div className="min-w-0">
          <KpiCard
            variant={3}
            label="Cantidad de productos"
            value={data.totalProducts}
            icon={<HiCube className="h-6 w-6 sm:h-7 sm:w-7" />}
          />
        </div>
        <div className="min-w-0">
          <KpiCard
            variant={4}
            label={
              <span className="inline-flex items-center gap-1">
                Productos casi agotados
                <FormSelect
                  variant="compact"
                  aria-label="Umbral de stock bajo"
                  value={String(lowStockThreshold)}
                  onChange={handleThresholdChange}
                  options={[...LOW_STOCK_OPTIONS]}
                  triggerClassName="!py-0 !px-1 !text-[10px] !min-h-0 !h-5 inline-flex"
                />
              </span>
            }
            value={data.lowStockCount}
            icon={<HiExclamationTriangle className="h-6 w-6 sm:h-7 sm:w-7" />}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-none lg:flex-row lg:items-stretch">
        <section className="flex max-lg:min-h-[260px] flex-1 flex-col rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] p-3 shadow-sm dark:shadow-none lg:min-h-0 lg:min-w-0">
          <div className="mb-2 min-w-0">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Pedidos por día
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Últimos 30 días
            </p>
          </div>
          <div
            className="flex min-h-[200px] w-full min-w-0 flex-1 lg:h-[300px] lg:min-h-[300px] lg:flex-none"
            role="img"
            aria-label="Gráfico de pedidos por día"
          >
            {dailyOrdersChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyOrdersChart}
                  margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgb(0 0 0 / 0.06)"
                    className="dark:stroke-night-700"
                  />
                  <XAxis
                    dataKey="dayLabel"
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      borderRadius: 6,
                      border: '1px solid rgb(0 0 0 / 0.08)',
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="pedidos"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                Sin datos de pedidos
              </div>
            )}
          </div>
        </section>

        <section className="flex max-lg:min-h-[260px] flex-1 flex-col rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] p-3 shadow-sm dark:shadow-none lg:min-h-0 lg:min-w-0">
          <div className="mb-2 min-w-0">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Ventas mensuales
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Ingresos y pedidos por mes
            </p>
          </div>
          <div
            className="flex min-h-[200px] w-full min-w-0 flex-1 lg:h-[300px] lg:min-h-[300px] lg:flex-none"
            role="img"
            aria-label="Gráfico de ventas mensuales"
          >
            {monthlySalesChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlySalesChart}
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
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={false}
                    formatter={(value: number, name: string) =>
                      name === 'ingresos'
                        ? [formatPrice(value), 'Ingresos']
                        : [value, 'Pedidos']
                    }
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload as { month?: string } | undefined;
                      return row?.month ?? '';
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
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="pedidos"
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
      </div>

      {topStoresChart.length > 0 && (
        <section className="flex max-lg:min-h-[220px] flex-col rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] p-3 shadow-sm dark:shadow-none lg:min-h-0">
          <div className="mb-2 min-w-0">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Mis tiendas por ganancia
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Ganancias netas del vendedor por tienda
            </p>
          </div>
          <div
            className="flex min-h-[180px] w-full min-w-0 flex-1 lg:h-[240px] lg:min-h-[240px] lg:flex-none"
            role="img"
            aria-label="Gráfico de ganancias por tienda"
          >
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
                  dataKey="ganancia"
                  name="Ganancia"
                  fill="var(--admin-primary, #2563eb)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
}
