import { formatPrice } from '../../helpers/formatPrice';
import { useSellerVentasQuery } from '../../queries/useSellerVentasQuery';
import type { SellerVentasRow } from '../../types/admin';

export function SellerVentasPage() {
  const { data, isLoading, isError } = useSellerVentasQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-500">Cargando ventas…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-sm text-red-600">
        No se pudieron cargar las ventas.
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Ventas
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Desglose de ventas, comisiones y ganancias por tienda
      </p>

      {!data?.length ? (
        <p className="mt-10 text-center text-sm text-zinc-500">
          Sin datos de ventas. ¿Tienes tiendas aprobadas?
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-md bg-white shadow-market ring-1 ring-zinc-200/70 dark:bg-night-900 dark:ring-night-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-night-800">
                <th className="px-4 py-3">Tienda</th>
                <th className="px-4 py-3 text-right">Ventas totales</th>
                <th className="px-4 py-3 text-right">Comisión</th>
                <th className="px-4 py-3 text-right">Mi ganancia</th>
                <th className="px-4 py-3 text-right">Comisión admin</th>
                <th className="px-4 py-3 text-right">Cantidad de pedidos</th>
                <th className="px-4 py-3 text-right">Productos activos</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: SellerVentasRow) => (
                <tr
                  key={row.storeId}
                  className="border-b border-zinc-50 last:border-0 dark:border-night-800/80"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {row.storeName}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatPrice(row.totalRevenue)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {row.commission}%
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                    {formatPrice(row.sellerEarnings)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatPrice(row.adminEarnings)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {row.totalOrders}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {row.activeProducts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
