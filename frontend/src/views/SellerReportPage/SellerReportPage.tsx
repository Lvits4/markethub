import { formatPrice } from '../../helpers/formatPrice';
import { useSellerReportQuery } from '../../queries/useSellerReportQuery';
import { useSellerDashboardQuery } from '../../queries/useSellerDashboardQuery';

function StatBlock({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md bg-white p-5 shadow-market ring-1 ring-zinc-200/70 dark:bg-night-900 dark:ring-night-800">
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

export function SellerReportPage() {
  const { data, isLoading, isError } = useSellerReportQuery();
  const sellerDash = useSellerDashboardQuery();

  const commissionOwed = sellerDash.data?.commissionOwed ?? 0;
  const sellerEarnings = sellerDash.data?.sellerEarnings ?? 0;

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Informe de ventas
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Datos analíticos por producto
      </p>

      {isLoading ? (
        <p className="mt-10 text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="mt-10 text-center text-sm text-red-600">
          No se pudo cargar el informe. ¿Tienes al menos una tienda registrada?
        </p>
      ) : !data ? (
        <p className="mt-10 text-center text-sm text-zinc-500">Sin datos.</p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatBlock label="Ventas totales" value={formatPrice(data.totalSales)} />
            <StatBlock
              label="Ganancia neta"
              value={formatPrice(sellerEarnings)}
              hint={`Comisión total: ${formatPrice(commissionOwed)}`}
            />
            <StatBlock
              label="Pedidos"
              value={String(data.totalOrders)}
              hint={`${data.completedOrders} completados · ${data.pendingOrders} pendientes (aprox.)`}
            />
          </div>
          {data.productSales.length > 0 ? (
            <div className="mt-8 market-table-wrap">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-night-800">
                    <th className="w-8 px-2 py-3 text-center text-zinc-400 dark:text-slate-500">#</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Unidades</th>
                    <th className="px-4 py-3">Ingresos</th>
                    <th className="px-4 py-3">Comisión</th>
                    <th className="px-4 py-3">Ganancia neta</th>
                  </tr>
                </thead>
                <tbody>
                  {data.productSales.map((row, i) => {
                    const commissionPct = sellerDash.data?.topStoresByEarnings?.[0]?.commission ?? 5;
                    const commissionAmt = row.revenue * (commissionPct / 100);
                    const netEarnings = row.revenue - commissionAmt;
                    return (
                      <tr
                        key={`${row.name}-${i}`}
                        className="border-b border-zinc-50 last:border-0 dark:border-night-800/80"
                      >
                        <td className="w-8 px-2 py-3 text-center tabular-nums text-zinc-400 dark:text-slate-500">
                          {i + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                          {row.name}
                        </td>
                        <td className="px-4 py-3 tabular-nums">{row.quantity}</td>
                        <td className="px-4 py-3 tabular-nums">
                          {formatPrice(row.revenue)}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-amber-600 dark:text-amber-400">
                          {formatPrice(commissionAmt)}
                        </td>
                        <td className="px-4 py-3 tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                          {formatPrice(netEarnings)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
