import { formatPrice } from '../../helpers/formatPrice';
import { useAdminProductsQuery } from '../../queries/useAdminProductsQuery';
import { AdminProductRowActions } from './AdminProductRowActions';

function numPrice(v: string | number) {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export function AdminProductsPage() {
  const { data, isLoading, isError } = useAdminProductsQuery();

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Productos
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Catálogo global (
        <code className="rounded-md bg-zinc-100 px-1 text-xs dark:bg-night-800">
          GET /admin/products
        </code>
        ). La creación y edición de productos sigue las rutas de vendedor (
        <code className="rounded-md bg-zinc-100 px-1 text-xs dark:bg-night-800">
          /products
        </code>
        ) con tu sesión de administrador.
      </p>

      {isLoading ? (
        <p className="mt-10 text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="mt-10 text-center text-sm text-red-600">
          No se pudieron cargar los productos.
        </p>
      ) : !data?.length ? (
        <p className="mt-10 text-center text-sm text-zinc-500">
          No hay productos.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-md bg-white shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-night-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-night-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-night-800">
                <th className="px-5 py-4">Producto</th>
                <th className="px-5 py-4">Tienda</th>
                <th className="px-5 py-4">Categoría</th>
                <th className="px-5 py-4">Precio</th>
                <th className="px-5 py-4">Stock</th>
                <th className="px-5 py-4">Activo</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-zinc-50 last:border-0 dark:border-night-800/80"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {p.name}
                    </p>
                    <p className="text-xs text-zinc-500">{p.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                    {p.store?.name ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                    {p.category?.name ?? '—'}
                  </td>
                  <td className="px-5 py-4 tabular-nums">
                    {formatPrice(numPrice(p.price))}
                  </td>
                  <td className="px-5 py-4 tabular-nums">{p.stock}</td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        p.isActive
                          ? 'text-[var(--color-forest)] dark:text-blue-400'
                          : 'text-zinc-400'
                      }
                    >
                      {p.isActive ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <AdminProductRowActions productId={p.id} storeId={p.storeId} />
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
