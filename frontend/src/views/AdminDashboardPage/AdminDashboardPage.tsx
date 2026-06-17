import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  HiUsers,
  HiUserGroup,
  HiBuildingStorefront,
  HiCube,
  HiShoppingBag,
} from 'react-icons/hi2';
import { DashboardStatCard } from '../../components/DashboardStatCard/DashboardStatCard';
import { FormSelect } from '../../components/CreateProductForm/FormSelect';
import { OverflowTooltip } from '../../components/OverflowTooltip/OverflowTooltip';
import { formatPrice } from '../../helpers/formatPrice/formatPrice';
import { getRechartsTooltipStyles } from '../../helpers/rechartsTooltipStyles/rechartsTooltipStyles';
import { useTheme } from '../../hooks/useTheme/useTheme';
import { useAdminDashboardQuery } from '../../queries/useAdminDashboardQuery/useAdminDashboardQuery';
import type { AdminRecentSaleRow } from '../../types/admin/admin';

const DAY_RANGE_OPTIONS = [
  { value: '7', label: '7 días' },
  { value: '14', label: '14 días' },
  { value: '30', label: '30 días' },
] as const;

const CHART_BAR_COLOR = '#3474db';
const CHART_GRID_LIGHT = 'rgb(0 0 0 / 0.06)';
const CHART_GRID_DARK = 'rgb(255 255 255 / 0.08)';
const CHART_TICK = '#71717a';

const PERIOD_SUMMARY_COLOR = '#3474db';
const PERIOD_SUMMARY_FILL = 'rgba(52, 116, 219, 0.28)';

const PERIOD_METRIC_LEGEND: Record<string, string> = {
  Ingresos: 'Ingresos del período',
  Pedidos: 'Pedidos del período',
  'Tiendas pend.': 'Tiendas pendientes',
  'Comisión admin': 'Comisión admin (est.)',
  'Ventas totales': 'Ventas totales',
};

type PeriodSummaryMetric = {
  metric: string;
  raw: number;
  scaled: number;
  display: string;
};

function PeriodSummaryLegend({ items }: { items: PeriodSummaryMetric[] }) {
  return (
    <ul className="dashboard-period-legend" aria-label="Leyenda del resumen del período">
      {items.map((item) => {
        const label = PERIOD_METRIC_LEGEND[item.metric] ?? item.metric;
        return (
          <li key={item.metric} className="dashboard-period-legend__item">
            <span className="dashboard-period-legend__dot" aria-hidden />
            <OverflowTooltip
              as="span"
              tooltip={label}
              className="dashboard-period-legend__label"
            >
              {label}
            </OverflowTooltip>
            <span className="dashboard-period-legend__value">{item.display}</span>
          </li>
        );
      })}
    </ul>
  );
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

function formatDayLabel(day: string) {
  const d = new Date(day + 'T00:00:00');
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short' });
}

type ChartAxisTickProps = {
  x?: number;
  y?: number;
  payload?: { value?: string };
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit';
  fill?: string;
  rotate?: number;
};

function ChartAxisTick({
  x = 0,
  y = 0,
  payload,
  textAnchor = 'middle',
  fill = CHART_TICK,
  rotate = 0,
}: ChartAxisTickProps) {
  const label = String(payload?.value ?? '');
  const textRef = useRef<SVGTextElement>(null);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const showTooltip = () => {
    const el = textRef.current;
    if (!el || !label.trim()) return;
    const rect = el.getBoundingClientRect();
    setCoords({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    setVisible(true);
  };

  const hideTooltip = () => setVisible(false);

  return (
    <g
      transform={rotate ? `translate(${x},${y}) rotate(${rotate})` : undefined}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      style={{ cursor: 'default', pointerEvents: 'all' }}
    >
      <text
        ref={textRef}
        x={rotate ? 0 : x}
        y={rotate ? 0 : y}
        textAnchor={textAnchor}
        fill={fill}
        fontSize={10}
        dominantBaseline="central"
        style={{ pointerEvents: 'all' }}
      >
        {label}
      </text>
      {visible &&
        createPortal(
          <div
            role="tooltip"
            className="overflow-tooltip"
            style={{ left: coords.x, top: coords.y }}
          >
            {label}
          </div>,
          document.body,
        )}
    </g>
  );
}

function RecentSaleItem({ sale }: { sale: AdminRecentSaleRow }) {
  const d = new Date(sale.soldAt);
  const dateStr = d.toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  const statusLabel = ORDER_STATUS_LABEL[sale.status] ?? sale.status;
  const storeName = sale.storeName ?? 'Tienda eliminada';
  const buyerLine = `${sale.buyerName ?? sale.buyerEmail ?? '—'} · ${dateStr}`;

  return (
    <div className="dashboard-activity-item">
      <span className="dashboard-activity-item__dot" aria-hidden />
      <div className="min-w-0 flex-1">
        <OverflowTooltip
          as="p"
          tooltip={storeName}
          className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          {storeName}
        </OverflowTooltip>
        <OverflowTooltip
          as="p"
          tooltip={buyerLine}
          className="truncate text-xs text-zinc-500 dark:text-zinc-400"
        >
          {buyerLine}
        </OverflowTooltip>
      </div>
      <div className="min-w-0 shrink-0 text-right">
        <OverflowTooltip
          as="p"
          tooltip={formatPrice(Number(sale.totalAmount) || 0)}
          className="truncate text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50"
        >
          {formatPrice(Number(sale.totalAmount) || 0)}
        </OverflowTooltip>
        <OverflowTooltip
          as="span"
          tooltip={statusLabel}
          className="mt-0.5 inline-block max-w-full truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-blue-600 ring-1 ring-inset ring-blue-500/25 dark:text-market-dark-accent dark:ring-market-dark-accent/30"
        >
          {statusLabel}
        </OverflowTooltip>
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const tooltipStyles = getRechartsTooltipStyles(isDark);

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

  const periodTotals = useMemo(() => {
    return chartData.reduce(
      (acc, row) => ({
        ingresos: acc.ingresos + row.ingresos,
        pedidos: acc.pedidos + row.pedidos,
      }),
      { ingresos: 0, pedidos: 0 },
    );
  }, [chartData]);

  const periodSummaryChart = useMemo((): PeriodSummaryMetric[] => {
    if (!data) return [];

    const periodCommission =
      data.revenue.totalSales > 0
        ? (data.revenue.adminEarnings / data.revenue.totalSales) * periodTotals.ingresos
        : 0;

    const metrics: PeriodSummaryMetric[] = [
      {
        metric: 'Ingresos',
        raw: periodTotals.ingresos,
        scaled: 0,
        display: formatPrice(periodTotals.ingresos),
      },
      {
        metric: 'Pedidos',
        raw: periodTotals.pedidos,
        scaled: 0,
        display: String(periodTotals.pedidos),
      },
      {
        metric: 'Tiendas pend.',
        raw: data.stores.pending,
        scaled: 0,
        display: String(data.stores.pending),
      },
      {
        metric: 'Comisión admin',
        raw: periodCommission,
        scaled: 0,
        display: formatPrice(periodCommission),
      },
      {
        metric: 'Ventas totales',
        raw: data.revenue.totalSales,
        scaled: 0,
        display: formatPrice(data.revenue.totalSales),
      },
    ];

    const max = Math.max(...metrics.map((item) => item.raw), 1);
    return metrics.map((item) => ({
      ...item,
      scaled: max > 0 ? Math.round((item.raw / max) * 100) : 0,
    }));
  }, [data, periodTotals]);

  const periodSummaryHasData = periodSummaryChart.some((item) => item.raw > 0);

  const dayRangeLabel =
    DAY_RANGE_OPTIONS.find((o) => o.value === String(dayRange))?.label ?? `${dayRange} días`;

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
    <div className="flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
      <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-5">
        <DashboardStatCard
          label="Total usuarios"
          value={data.users.total}
          icon={<HiUsers />}
        />
        <DashboardStatCard
          label="Total clientes"
          value={data.users.customers}
          icon={<HiUserGroup />}
        />
        <DashboardStatCard
          label="Tiendas activas"
          value={data.stores.approved}
          icon={<HiBuildingStorefront />}
        />
        <DashboardStatCard
          label="Productos activos"
          value={data.products.active}
          icon={<HiCube />}
        />
        <DashboardStatCard
          label="Pedidos completados"
          value={data.orders.completed}
          icon={<HiShoppingBag />}
        />
      </div>

      <div className="grid shrink-0 grid-cols-1 gap-3 sm:gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-12 lg:items-stretch">
        <section className="dashboard-panel lg:col-span-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <OverflowTooltip
                as="h2"
                tooltip="Ingresos por día"
                className="dashboard-panel__title"
              >
                Ingresos por día
              </OverflowTooltip>
              <OverflowTooltip
                as="p"
                tooltip={`Ventas diarias · ${dayRangeLabel}`}
                className="dashboard-panel__subtitle"
              >
                Ventas diarias · {dayRangeLabel}
              </OverflowTooltip>
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
            className="dashboard-chart-area"
            role="img"
            aria-label="Gráfico de ingresos por día"
          >
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                  barCategoryGap="18%"
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke={isDark ? CHART_GRID_DARK : CHART_GRID_LIGHT}
                  />
                  <XAxis
                    dataKey="dayLabel"
                    tick={(props) => (
                      <ChartAxisTick {...props} textAnchor="end" rotate={-35} />
                    )}
                    axisLine={false}
                    tickLine={false}
                    interval={dayRange === 30 ? 4 : dayRange === 14 ? 1 : 0}
                    height={52}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: CHART_TICK }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                    }
                  />
                  <Tooltip
                    cursor={{ fill: isDark ? 'rgb(255 255 255 / 0.04)' : 'rgb(0 0 0 / 0.04)' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'ingresos') return [formatPrice(value), 'Ingresos'];
                      return [value, 'Pedidos'];
                    }}
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload as { day?: string } | undefined;
                      if (!row?.day) return '';
                      return new Date(row.day + 'T00:00:00').toLocaleDateString('es', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'long',
                      });
                    }}
                    contentStyle={tooltipStyles.contentStyle}
                    labelStyle={tooltipStyles.labelStyle}
                  />
                  <Bar
                    dataKey="ingresos"
                    name="ingresos"
                    fill={CHART_BAR_COLOR}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                Sin datos en este período
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-panel lg:col-span-4">
          <div className="mb-3 min-w-0">
            <OverflowTooltip
              as="h2"
              tooltip="Resumen del período"
              className="dashboard-panel__title"
            >
              Resumen del período
            </OverflowTooltip>
            <OverflowTooltip
              as="p"
              tooltip={`Métricas de los últimos ${dayRangeLabel}`}
              className="dashboard-panel__subtitle"
            >
              Métricas de los últimos {dayRangeLabel}
            </OverflowTooltip>
          </div>
          <div
            className="dashboard-chart-area dashboard-chart-area--with-legend overflow-visible [&_.recharts-surface]:overflow-visible"
            role="img"
            aria-label="Gráfico de resumen del período"
          >
            {periodSummaryHasData ? (
              <>
                <div className="dashboard-chart-area__plot min-h-0 w-full flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={periodSummaryChart}
                      cx="50%"
                      cy="50%"
                      outerRadius="92%"
                      margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
                    >
                      <PolarGrid stroke={isDark ? CHART_GRID_DARK : CHART_GRID_LIGHT} />
                      <PolarAngleAxis dataKey="metric" tick={false} axisLine={false} />
                      <Radar
                        name="Resumen"
                        dataKey="scaled"
                        stroke={PERIOD_SUMMARY_COLOR}
                        fill={PERIOD_SUMMARY_FILL}
                        fillOpacity={1}
                        strokeWidth={2}
                      />
                      <Tooltip
                        formatter={(_value: number, _name, item) => {
                          const metric = item.payload as PeriodSummaryMetric;
                          const label = PERIOD_METRIC_LEGEND[metric.metric] ?? metric.metric;
                          return [metric.display, label];
                        }}
                        labelFormatter={() => `Últimos ${dayRangeLabel}`}
                        contentStyle={tooltipStyles.contentStyle}
                        labelStyle={tooltipStyles.labelStyle}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <PeriodSummaryLegend items={periodSummaryChart} />
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                Sin datos en este período
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-panel lg:col-span-4">
          <div className="mb-3 min-w-0 shrink-0">
            <OverflowTooltip
              as="h2"
              tooltip="Actividad reciente"
              className="dashboard-panel__title"
            >
              Actividad reciente
            </OverflowTooltip>
            <OverflowTooltip
              as="p"
              tooltip="Últimos 10 pedidos"
              className="dashboard-panel__subtitle"
            >
              Últimos 10 pedidos
            </OverflowTooltip>
          </div>
          <div className="dashboard-activity-area market-scroll overflow-y-auto overscroll-contain pr-0.5">
            {data.recentSales.length > 0 ? (
              data.recentSales.map((sale) => (
                <RecentSaleItem key={sale.orderId} sale={sale} />
              ))
            ) : (
              <div className="flex h-32 items-center justify-center text-xs text-zinc-500">
                Sin ventas recientes
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
