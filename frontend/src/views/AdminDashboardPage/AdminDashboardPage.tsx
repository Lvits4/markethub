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
import { HiUsers, HiUserGroup, HiBuildingStorefront, HiCube } from 'react-icons/hi2';
import { FormSelect } from '../../components/CreateProductForm/FormSelect';
import { formatPrice } from '../../helpers/formatPrice';
import { useAdminDashboardQuery } from '../../queries/useAdminDashboardQuery';
import type { AdminRecentSaleRow } from '../../types/admin';

const DAY_RANGE_OPTIONS = [
  { value: '7', label: '7 días' },
  { value: '14', label: '14 días' },
  { value: '30', label: '30 días' },
] as const;

const KPI_STYLES = [
  { accent: 'border-l-blue-500 dark:border-l-blue-400', icon: 'text-blue-500 dark:text-blue-400' },
  { accent: 'border-l-indigo-500 dark:border-l-indigo-400', icon: 'text-indigo-500 dark:text-indigo-400' },
  { accent: 'border-l-sky-500 dark:border-l-sky-400', icon: 'text-sky-500 dark:text-sky-400' },
  { accent: 'border-l-cyan-500 dark:border-l-cyan-400', icon: 'text-cyan-500 dark:text-cyan-400' },
] as const;

function KpiCard({
  label,
  value,
  icon,
  variant,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant: 0 | 1 | 2 | 3;
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

function formatDayLabel(day: string) {
  const d = new Date(day + 'T00:00:00');
  return d.toLocaleDateString('es', { day: '2-digit', month: '2-digit' });
}

function RecentSaleRow({ sale }: { sale: AdminRecentSaleRow }) {
  const d = new Date(sale.createdAt);
  const dateStr = d.toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <div className="flex items-center gap-3 rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {sale.storeName ?? 'Tienda eliminada'}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {sale.buyerName ?? sale.buyerEmail ?? '—'} · {dateStr}
        </p>
      </div>
      <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
        {formatPrice(Number(sale.totalAmount) || 0)}
      </p>
    </div>
  );
}

export function AdminDashboardPage() {
  const [dayRange, setDayRange] = useState<7 | 14 | 30>(() => {
    const saved = localStorage.getItem('adminDashboardDayRange');
    const n = saved ? Number(saved) : 7;
    return n === 14 || n === 30 ? n : 7;
  });

  const { data, isLoading, isError } = useAdminDashboardQuery(dayRange);

  const handleDayRangeChange = (v: string) => {
    const n = Number(v);
    if (n === 7 || n === 14 || n === 30) {
      setDayRange(n);
      localStorage.setItem('adminDashboardDayRange', String(n));
    }
  };

  const chartData = useMemo(() => {
    if (!data?.dailySales) return [];
    return data.dailySales.map((row) => ({
      day: row.day,
      dayLabel: formatDayLabel(row.day),
      ingresos: Number.parseFloat(String(row.totalRevenue)) || 0,
      pedidos: Number.parseInt(String(row.totalOrders), 10) || 0,
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
            Resumen de MarketHub
          </p>
        </div>
      </header>

      <div className="grid shrink-0 grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 xl:grid-cols-4">
        <div className="min-w-0">
          <KpiCard
            variant={0}
            label="Total usuarios"
            value={data.users.total}
            icon={<HiUsers className="h-6 w-6 sm:h-7 sm:w-7" />}
          />
        </div>
        <div className="min-w-0">
          <KpiCard
            variant={1}
            label="Total clientes"
            value={data.users.customers}
            icon={<HiUserGroup className="h-6 w-6 sm:h-7 sm:w-7" />}
          />
        </div>
        <div className="min-w-0">
          <KpiCard
            variant={2}
            label="Total tiendas"
            value={data.stores.approved}
            icon={<HiBuildingStorefront className="h-6 w-6 sm:h-7 sm:w-7" />}
          />
        </div>
        <div className="min-w-0">
          <KpiCard
            variant={3}
            label="Total productos"
            value={data.products.total}
            icon={<HiCube className="h-6 w-6 sm:h-7 sm:w-7" />}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-none lg:flex-row lg:items-stretch">
        <section className="flex max-lg:min-h-[260px] flex-1 flex-col rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] p-3 shadow-sm dark:shadow-none lg:min-h-0 lg:min-w-0">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Ventas por día
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Ingresos y pedidos diarios
              </p>
            </div>
            <FormSelect
              variant="compact"
              aria-label="Rango de días"
              value={String(dayRange)}
              onChange={handleDayRangeChange}
              options={[...DAY_RANGE_OPTIONS]}
            />
          </div>
          <div
            className="flex min-h-[200px] w-full min-w-0 flex-1 lg:h-[300px] lg:min-h-[300px] lg:flex-none"
            role="img"
            aria-label="Gráfico de ventas por día"
          >
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
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
                      const row = payload?.[0]?.payload as { day?: string } | undefined;
                      return row?.day ?? '';
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
                Sin datos diarios
              </div>
            )}
          </div>
        </section>

        <section className="flex max-lg:min-h-[260px] flex-1 flex-col rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] p-3 shadow-sm dark:shadow-none lg:min-h-0 lg:min-w-0">
          <div className="mb-2 min-w-0">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Historial de ventas recientes
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Últimos 10 pedidos (sin cancelados)
            </p>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            {data.recentSales.length > 0 ? (
              data.recentSales.map((sale) => (
                <RecentSaleRow key={sale.orderId} sale={sale} />
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                Sin ventas recientes
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
