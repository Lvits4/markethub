import { useMemo, useState } from 'react';
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
import { FiPlus } from 'react-icons/fi';
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

function pctChange(cur: number, prev: number): { pct: number; up: boolean } | null {
  if (!Number.isFinite(prev) || prev === 0) return null;
  const raw = ((cur - prev) / prev) * 100;
  return { pct: Math.abs(raw), up: raw >= 0 };
}

function KpiCard({
  label,
  value,
  hint,
  trend,
}: {
  label: string;
  value: string | number;
  hint?: string;
  trend?: { pct: number; up: boolean } | null;
}) {
  return (
    <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-sm dark:shadow-none">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {trend ? (
          <span
            className={`text-sm font-semibold ${trend.up ? 'text-[var(--admin-primary)]' : 'text-red-500'}`}
          >
            {trend.up ? '↑' : '↓'} {trend.pct.toFixed(1)}%
          </span>
        ) : (
          <span className="text-sm text-zinc-400">—</span>
        )}
        {hint ? (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</span>
        ) : null}
      </div>
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

  const revenueTrend = useMemo(() => {
    const m = sales.data?.monthlySales ?? [];
    if (m.length < 2) return null;
    const cur = Number.parseFloat(String(m[0].totalRevenue)) || 0;
    const prev = Number.parseFloat(String(m[1].totalRevenue)) || 0;
    return pctChange(cur, prev);
  }, [sales.data]);

  const ordersTrend = useMemo(() => {
    const m = sales.data?.monthlySales ?? [];
    if (m.length < 2) return null;
    const cur = Number.parseInt(String(m[0].totalOrders), 10) || 0;
    const prev = Number.parseInt(String(m[1].totalOrders), 10) || 0;
    return pctChange(cur, prev);
  }, [sales.data]);

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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Panel
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Resumen de MarketHub · datos en vivo de la API
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="admin-period" className="text-sm text-zinc-500">
            Periodo gráficos
          </label>
          <select
            id="admin-period"
            value={periodMonths}
            onChange={(e) =>
              setPeriodMonths(Number(e.target.value) as 3 | 6 | 12)
            }
            className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm dark:text-zinc-100"
          >
            <option value={3}>Últimos 3 meses</option>
            <option value={6}>Últimos 6 meses</option>
            <option value={12}>Últimos 12 meses</option>
          </select>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Clientes"
          value={data.users.customers}
          hint="registrados"
          trend={null}
        />
        <KpiCard
          label="Ingresos cobrados"
          value={formatPrice(data.revenue.totalSales)}
          hint="vs. mes anterior (informe)"
          trend={revenueTrend}
        />
        <KpiCard
          label="Pedidos"
          value={data.orders.total}
          hint="vs. mes anterior"
          trend={ordersTrend}
        />
        <KpiCard
          label="Tiendas pendientes"
          value={data.stores.pending}
          hint="revisar moderación"
          trend={null}
        />
        <NavLink
          to={routePaths.adminSales}
          className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-transparent p-5 text-center transition-colors hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-soft)] dark:border-zinc-600"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <FiPlus className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Informes detallados
          </span>
          <span className="text-xs text-zinc-500">Ventas, rankings y más</span>
        </NavLink>
      </div>

      <section className="mt-8 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-sm dark:shadow-none">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Ventas por mes
        </h2>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          Ingresos (USD) y volumen de pedidos por mes
        </p>
        <div className="mt-6 h-[320px] w-full min-w-0">
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

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-sm dark:shadow-none">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Ingresos por producto
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Participación según pedidos de la plataforma
          </p>
          <div className="mt-4 flex flex-col items-center gap-4 lg:flex-row lg:items-center">
            <div className="h-[260px] w-full max-w-[280px]">
              {donutData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={96}
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
              <ul className="w-full max-w-sm flex-1 space-y-2 text-sm">
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

        <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-sm dark:shadow-none">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Ventas por tienda
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Reparto de ingresos entre las tiendas con más actividad
          </p>
          <div className="mt-5 space-y-4">
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
          <div className="mt-6 rounded-xl bg-[var(--admin-primary-soft)] p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-primary)]">
              Mapa / regiones
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Cuando tengas datos por país o región, podrás enlazarlos aquí. Por
              ahora el reparto por tienda sustituye esa vista.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
