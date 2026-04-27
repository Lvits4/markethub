import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { routePaths } from '../../config/routes';
import { formatPrice } from '../../helpers/formatPrice';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useDeleteProductMutation } from '../../hooks/useProductSellerMutations';
import { useMyStoresQuery } from '../../queries/useMyStoresQuery';
import { useProductsByStoreQuery } from '../../queries/useProductsByStoreQuery';

function numPrice(v: string | number) {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export function SellerStoreProductsPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { data: stores } = useMyStoresQuery();
  const { data, isLoading, isError } = useProductsByStoreQuery(storeId, {
    page: 1,
    limit: 50,
  });
  const deleteMut = useDeleteProductMutation(storeId);

  const store = stores?.find((s) => s.id === storeId);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-500">Cargando…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-sm text-red-600">
        No se pudieron cargar los productos.
      </p>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            to={routePaths.sellerProducts}
            className="text-sm font-medium text-admin-primary hover:underline"
          >
            ← Productos
          </Link>
          <span className="text-zinc-400">/</span>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {store?.name ?? storeId}
          </span>
        </div>
        <Link
          to={`${routePaths.sellerProductNew}?storeId=${encodeURIComponent(storeId ?? '')}`}
          className="admin-cta-solid inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold"
        >
          Nuevo producto
        </Link>
      </div>

      {!data?.data.length ? (
        <p className="text-center text-sm text-zinc-500">
          No hay productos en esta tienda.
        </p>
      ) : (
        <div className="admin-table-panel">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="no-scrollbar shrink-0 overflow-x-auto overflow-y-hidden border-b border-slate-200/80 dark:border-blue-500/15">
              <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-sm">
                <colgroup>
                  <col style={{ width: '3.5%' }} />
                  <col style={{ width: '28%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '14.5%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead className="bg-slate-100/92 backdrop-blur-md dark:bg-admin-elevated/95 dark:backdrop-blur-md">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    <th className="w-8 px-2 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      #
                    </th>
                    <th className="px-4 py-3.5">Producto</th>
                    <th className="px-4 py-3.5 text-right">Precio</th>
                    <th className="px-4 py-3.5 text-right">Stock</th>
                    <th className="px-4 py-3.5 text-center">Activo</th>
                    <th className="px-4 py-3.5 text-center">Tienda</th>
                    <th className="px-4 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="market-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto">
              <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-sm">
                <colgroup>
                  <col style={{ width: '3.5%' }} />
                  <col style={{ width: '28%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '14.5%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <tbody>
                  {data.data.map((p, i) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-200/55 transition-colors last:border-0 hover:bg-slate-50/90 dark:border-blue-500/10 dark:hover:bg-white/[0.06]"
                    >
                      <td className="w-8 px-2 py-2 text-center tabular-nums text-slate-400 dark:text-slate-500">
                        {i + 1}
                      </td>
                      <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">
                        {p.name}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                        {formatPrice(numPrice(p.price))}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                        {p.stock}
                      </td>
                      <td className="px-4 py-2 text-center text-slate-700 dark:text-slate-300">
                        {p.isActive ? 'Sí' : 'No'}
                      </td>
                      <td className="px-4 py-2 text-center text-slate-500 dark:text-slate-400">
                        {store?.name ?? storeId}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={routePaths.sellerProductEdit(p.id)}
                            className="text-sm font-medium text-admin-primary hover:underline"
                          >
                            Editar
                          </Link>
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-xs text-red-600"
                            disabled={deleteMut.isPending}
                            onClick={() => {
                              if (
                                !window.confirm(
                                  '¿Eliminar este producto de forma permanente? No podrás deshacerlo. Si tiene pedidos asociados, no se eliminará.',
                                )
                              )
                                return;
                              deleteMut.mutate(p.id, {
                                onSuccess: () => toast.success('Producto eliminado'),
                                onError: (e) => toast.error(getErrorMessage(e)),
                              });
                            }}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
