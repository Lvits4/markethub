import { formatPrice } from '../../helpers/formatPrice';
import { useAdminPlatformReportQuery } from '../../queries/useAdminPlatformReportQuery';
import { useAdminSalesReportQuery } from '../../queries/useAdminSalesReportQuery';

function StatBlock({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-zinc-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function AdminSalesPage() {
  const sales = useAdminSalesReportQuery();
  const platform = useAdminPlatformReportQuery();

  const loading = sales.isLoading || platform.isLoading;
  const err = sales.isError || platform.isError;

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Ventas y reportes
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Combina el reporte administrativo (
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
          GET /admin/reports/sales
        </code>
        ) con el agregado de pedidos para admin (
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
          GET /orders/store/report
        </code>
        ).
      </p>

      {loading ? (
        <p className="mt-10 text-center text-sm text-zinc-500">Cargando…</p>
      ) : err ? (
        <p className="mt-10 text-center text-sm text-red-600">
          No se pudieron cargar uno o ambos reportes.
        </p>
      ) : (
        <>
          {platform.data ? (
            <section className="mt-8">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Resumen de plataforma
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatBlock
                  label="Ventas totales"
                  value={formatPrice(platform.data.totalSales)}
                />
                <StatBlock
                  label="Pedidos"
                  value={String(platform.data.totalOrders)}
                  hint={`${platform.data.completedOrders} entregados · ${platform.data.pendingOrders} pendientes (aprox.)`}
                />
                <StatBlock
                  label="Productos en el desglose"
                  value={String(platform.data.productSales.length)}
                  hint="Tabla inferior"
                />
              </div>
              {platform.data.productSales.length > 0 ? (
                <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-zinc-800">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3">Unidades</th>
                        <th className="px-4 py-3">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {platform.data.productSales.map((row, i) => (
                        <tr
                          key={`${row.name}-${i}`}
                          className="border-b border-zinc-50 last:border-0 dark:border-zinc-800/80"
                        >
                          <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                            {row.name}
                          </td>
                          <td className="px-4 py-3 tabular-nums">{row.quantity}</td>
                          <td className="px-4 py-3 tabular-nums">
                            {formatPrice(row.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>
          ) : null}

          {sales.data ? (
            <section className="mt-12">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Histórico mensual y top tiendas
              </h3>
              <div className="mt-4 grid gap-8 lg:grid-cols-2">
                <div className="overflow-x-auto rounded-2xl bg-white shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-zinc-800">
                  <table className="w-full min-w-[280px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                        <th className="px-4 py-3">Mes</th>
                        <th className="px-4 py-3">Pedidos</th>
                        <th className="px-4 py-3">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(sales.data.monthlySales ?? []).map((row) => (
                        <tr
                          key={row.month}
                          className="border-b border-zinc-50 last:border-0 dark:border-zinc-800/80"
                        >
                          <td className="px-4 py-3 font-medium">{row.month}</td>
                          <td className="px-4 py-3 tabular-nums">
                            {row.totalOrders}
                          </td>
                          <td className="px-4 py-3 tabular-nums">
                            {formatPrice(
                              Number.parseFloat(String(row.totalRevenue)) || 0,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="overflow-x-auto rounded-2xl bg-white shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-zinc-800">
                  <table className="w-full min-w-[280px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                        <th className="px-4 py-3">Tienda</th>
                        <th className="px-4 py-3">Pedidos</th>
                        <th className="px-4 py-3">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(sales.data.topStores ?? []).map((row) => (
                        <tr
                          key={row.storeId}
                          className="border-b border-zinc-50 last:border-0 dark:border-zinc-800/80"
                        >
                          <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                            {row.storeName}
                          </td>
                          <td className="px-4 py-3 tabular-nums">
                            {row.totalOrders}
                          </td>
                          <td className="px-4 py-3 tabular-nums">
                            {formatPrice(
                              Number.parseFloat(String(row.totalRevenue)) || 0,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
