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

  return (
    <div>
      <div className="mb-6">
        <Link
          to={routePaths.seller}
          className="text-sm font-medium text-[var(--color-forest)]"
        >
          ← Inicio
        </Link>
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Productos · {store?.name ?? storeId}
      </h2>
      <div className="mt-4">
        <Link
          to={`${routePaths.sellerProductNew}?storeId=${encodeURIComponent(storeId ?? '')}`}
          className="inline-flex rounded-md bg-[var(--color-forest)] px-5 py-2.5 text-sm font-semibold text-white dark:bg-[var(--color-market-dark-surface)] dark:text-[var(--color-market-dark-accent)] dark:hover:bg-[var(--color-market-dark-surface-hover)]"
        >
          Nuevo producto
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-10 text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="mt-10 text-center text-sm text-red-600">
          No se pudieron cargar los productos.
        </p>
      ) : !data?.data.length ? (
        <p className="mt-10 text-center text-sm text-zinc-500">
          No hay productos en esta tienda.
        </p>
      ) : (
        <div className="mt-8 market-table-wrap">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-night-800">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Activo</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-zinc-50 last:border-0 dark:border-night-800/80"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatPrice(numPrice(p.price))}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{p.stock}</td>
                  <td className="px-4 py-3">{p.isActive ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={routePaths.sellerProductEdit(p.id)}
                        className="text-sm font-medium text-[var(--color-forest)]"
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
      )}
    </div>
  );
}
