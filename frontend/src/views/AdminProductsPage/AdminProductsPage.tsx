import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiEdit2,
  FiEye,
  FiPackage,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { Button } from '../../components/Button/Button';
import { Modal } from '../../components/Modal/Modal';
import { AdminEditProductForm } from '../../components/AdminEditProductForm/AdminEditProductForm';
import { CreateProductForm } from '../../components/CreateProductForm/CreateProductForm';
import { useAuth } from '../../hooks/useAuth';
import { useProtectedImageSrc } from '../../hooks/useProtectedImageSrc';
import { formatPrice } from '../../helpers/formatPrice';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useDeleteProductMutation } from '../../hooks/useProductSellerMutations';
import { useAdminProductDetailQuery } from '../../queries/useAdminProductDetailQuery';
import { useAdminProductsQuery } from '../../queries/useAdminProductsQuery';
import type { AdminProductRow } from '../../types/admin';
import type { Product } from '../../types/product';

function numOrZero(v: string | number) {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

type SortKey = 'name' | 'store' | 'category' | 'price' | 'stock' | 'active';
type SortDir = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 10;
const COL_WIDTH = `${100 / 7}%`;

function AdminProductsTableColgroup() {
  return (
    <colgroup>
      {Array.from({ length: 7 }, (__, i) => (
        <col key={i} style={{ width: COL_WIDTH }} />
      ))}
    </colgroup>
  );
}

function compareProducts(
  a: AdminProductRow,
  b: AdminProductRow,
  key: SortKey,
  dir: SortDir,
): number {
  let cmp = 0;
  switch (key) {
    case 'name':
      cmp = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      break;
    case 'store':
      cmp = (a.store?.name ?? '').localeCompare(b.store?.name ?? '', 'es', {
        sensitivity: 'base',
      });
      break;
    case 'category':
      cmp = (a.category?.name ?? '').localeCompare(
        b.category?.name ?? '',
        'es',
        { sensitivity: 'base' },
      );
      break;
    case 'price':
      cmp = numOrZero(a.price) - numOrZero(b.price);
      break;
    case 'stock':
      cmp = a.stock - b.stock;
      break;
    case 'active':
      cmp = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0);
      break;
    default:
      cmp = 0;
  }
  return dir === 'asc' ? cmp : -cmp;
}

function matchesSearch(p: AdminProductRow, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  const chunks = [
    p.name,
    p.slug,
    p.store?.name,
    p.category?.name,
  ];
  return chunks.some((c) => (c ?? '').toLowerCase().includes(n));
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <div className="rounded-md border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-sky-500/20 dark:bg-[#0f1a38] dark:text-slate-200">
        {children}
      </div>
    </div>
  );
}

function ProductDetailImage({ url }: { url: string }) {
  const { token } = useAuth();
  const { src, loading, error } = useProtectedImageSrc(url, token);
  if (loading) {
    return (
      <span className="text-slate-400 dark:text-slate-500">Cargando…</span>
    );
  }
  if (error || !src) {
    return (
      <span className="text-slate-400 dark:text-slate-500">
        No se pudo mostrar
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className="max-h-28 w-auto max-w-full rounded object-contain"
    />
  );
}

function ProductDetailsPanel({ product }: { product: Product }) {
  return (
    <div className="market-scroll min-h-0 flex-1 overflow-y-auto px-4 py-3">
      <div className="space-y-4">
        <section className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {product.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              /{product.slug}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300">
              {formatPrice(numOrZero(product.price))}
            </span>
            <span className="rounded border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300">
              Stock: {product.stock}
            </span>
            <span
              className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${
                product.isActive
                  ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/35 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : 'border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-500/35 dark:bg-rose-500/10 dark:text-rose-300'
              }`}
            >
              {product.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </section>

        <section className="space-y-2 border-t border-slate-200/80 pt-3 dark:border-sky-500/20">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Información
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            <DetailField label="Tienda">
              {product.store?.name ?? '—'}
            </DetailField>
            <DetailField label="Categoría">
              {product.category?.name ?? '—'}
            </DetailField>
          </div>
          <DetailField label="Descripción">
            {product.description || 'Sin descripción'}
          </DetailField>
        </section>

        {product.images && product.images.length > 0 ? (
          <section className="space-y-2 border-t border-slate-200/80 pt-3 dark:border-sky-500/20">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Imágenes
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className="flex min-h-[5rem] items-center justify-center rounded-md border border-slate-200/80 bg-white p-2 dark:border-sky-500/20 dark:bg-[#0f1a38]"
                >
                  <ProductDetailImage url={img.url} />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function adminProductRowFromDetail(p: Product): AdminProductRow {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    stock: p.stock,
    isActive: p.isActive,
    storeId: p.storeId,
    store: p.store
      ? { id: p.store.id, name: p.store.name, slug: p.store.slug }
      : undefined,
    category: p.category
      ? { id: p.category.id, name: p.category.name }
      : null,
  };
}

function ProductDetailsDrawer({
  open,
  onClose,
  onEdit,
  onRequestDelete,
  deleteDisabled,
  isLoading,
  isError,
  product,
}: {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onRequestDelete?: () => void;
  deleteDisabled?: boolean;
  isLoading: boolean;
  isError: boolean;
  product?: Product;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-80 flex items-stretch justify-end bg-black/35"
      role="presentation"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Detalle de producto"
        className="flex h-full w-full max-w-[640px] flex-col border-l border-slate-200/80 bg-white shadow-2xl dark:border-sky-500/20 dark:bg-[#0b152f]"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 dark:border-sky-500/20 dark:bg-[#0d1938]">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Panel de detalles
          </h2>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-8 px-3 text-xs"
              onClick={onEdit}
              disabled={!product}
            >
              Editar
            </Button>
            {onRequestDelete ? (
              <Button
                type="button"
                variant="outline"
                className="h-8 border-rose-200 px-3 text-xs text-rose-700 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-950/40"
                onClick={onRequestDelete}
                disabled={!product || deleteDisabled}
              >
                Eliminar
              </Button>
            ) : null}
            <Button
              type="button"
              variant="icon"
              className="h-8 w-8 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-sky-500/20"
              aria-label="Cerrar panel"
              onClick={onClose}
            >
              <FiX className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden bg-[#f5f8fc] dark:bg-[#091126]">
          {isLoading ? (
            <p className="px-4 py-4 text-sm text-slate-500">
              Cargando detalle…
            </p>
          ) : isError ? (
            <p className="px-4 py-4 text-sm text-red-600">
              No se pudo cargar el detalle del producto.
            </p>
          ) : product ? (
            <ProductDetailsPanel product={product} />
          ) : (
            <p className="px-4 py-4 text-sm text-slate-500">
              No hay datos del producto.
            </p>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  align = 'left',
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey, direction: SortDir) => void;
  align?: 'left' | 'right';
}) {
  const active = activeKey === sortKey;
  return (
    <th
      className={`px-4 py-3.5 ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <div
        className={`inline-flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}
      >
        <span className="leading-tight">{label}</span>
        <span className="inline-flex shrink-0 items-center gap-px">
          <button
            type="button"
            className={`rounded p-0 leading-none transition-colors hover:bg-slate-200 dark:hover:bg-sky-950/50 ${active && dir === 'asc' ? 'text-[var(--color-forest)] dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`}
            aria-label={`Ordenar ${label} ascendente`}
            onClick={() => onSort(sortKey, 'asc')}
          >
            <FiChevronUp className="h-3 w-3" aria-hidden />
          </button>
          <button
            type="button"
            className={`rounded p-0 leading-none transition-colors hover:bg-slate-200 dark:hover:bg-sky-950/50 ${active && dir === 'desc' ? 'text-[var(--color-forest)] dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`}
            aria-label={`Ordenar ${label} descendente`}
            onClick={() => onSort(sortKey, 'desc')}
          >
            <FiChevronDown className="h-3 w-3" aria-hidden />
          </button>
        </span>
      </div>
    </th>
  );
}

export function AdminProductsPage() {
  const { data, isLoading, isError } = useAdminProductsQuery();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [viewProductId, setViewProductId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<AdminProductRow | null>(
    null,
  );
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [createProductOpen, setCreateProductOpen] = useState(false);

  const productDetailQuery = useAdminProductDetailQuery(viewProductId);

  const deleteStoreId = productToDelete?.storeId;
  const deleteMut = useDeleteProductMutation(deleteStoreId);

  const tableHeaderScrollRef = useRef<HTMLDivElement>(null);
  const tableBodyScrollRef = useRef<HTMLDivElement>(null);

  const onTableHeaderScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const left = e.currentTarget.scrollLeft;
      const body = tableBodyScrollRef.current;
      if (body && body.scrollLeft !== left) body.scrollLeft = left;
    },
    [],
  );

  const onTableBodyScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const left = e.currentTarget.scrollLeft;
      const header = tableHeaderScrollRef.current;
      if (header && header.scrollLeft !== left) header.scrollLeft = left;
    },
    [],
  );

  const products = Array.isArray(data) ? data : [];

  const filteredSorted = useMemo(() => {
    const q = search.trim();
    const list = products.filter((p) => matchesSearch(p, q));
    return [...list].sort((a, b) => compareProducts(a, b, sortKey, sortDir));
  }, [products, search, sortKey, sortDir]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSorted.length / pageSize) || 1,
  );

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, page, pageSize]);

  const handleSort = useCallback((key: SortKey, direction: SortDir) => {
    setSortKey(key);
    setSortDir(direction);
  }, []);

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    const deletedId = productToDelete.id;
    deleteMut.mutate(deletedId, {
      onSuccess: () => {
        toast.success('Producto eliminado');
        setProductToDelete(null);
        if (viewProductId === deletedId) {
          setViewProductId(null);
          setMode('view');
        }
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  const openDeleteForViewedProduct = useCallback(() => {
    if (!viewProductId) return;
    const row = products.find((x) => x.id === viewProductId);
    if (row) {
      setProductToDelete(row);
      return;
    }
    const d = productDetailQuery.data;
    if (d) setProductToDelete(adminProductRowFromDetail(d));
  }, [viewProductId, products, productDetailQuery.data]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h2 className="flex shrink-0 items-center gap-2.5 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        <FiPackage
          className="h-7 w-7 shrink-0 text-zinc-900 dark:text-zinc-50"
          aria-hidden
        />
        Productos
      </h2>

      {isLoading ? (
        <p className="text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="text-center text-sm text-red-600">
          No se pudieron cargar los productos.
        </p>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <FiSearch
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                aria-hidden
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por producto, slug, tienda o categoría…"
                className={`box-border h-11 w-full rounded-md border border-zinc-200 bg-white py-0 pl-10 text-sm leading-normal text-zinc-900 shadow-sm ring-zinc-200 placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]/25 dark:border-night-700 dark:bg-night-950 dark:text-zinc-50 dark:ring-night-800 ${search ? 'pr-11' : 'pr-4'}`}
                aria-label="Buscar productos"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                  aria-label="Limpiar búsqueda"
                >
                  <FiX className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
            <Button
              type="button"
              variant="primary"
              className="h-11 min-h-11 shrink-0 border-0 px-6 py-0 text-sm !bg-[#102251] !text-[#458bde] shadow-sm hover:!bg-[#152a5e] focus-visible:!ring-2 focus-visible:!ring-[#458bde]/35 dark:!bg-[#102251] dark:!text-[#458bde] dark:hover:!bg-[#152a5e]"
              onClick={() => setCreateProductOpen(true)}
            >
              Crear producto
            </Button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-[#f4f7fc]/92 shadow-[0_8px_32px_rgb(15_23_42/0.07)] backdrop-blur-xl dark:border-sky-500/25 dark:bg-[#0a1228]/92 dark:shadow-[0_24px_56px_-16px_rgb(0_0_0/0.55),inset_0_1px_0_0_rgb(56_189_248/0.11)] dark:backdrop-blur-xl">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div
                ref={tableHeaderScrollRef}
                onScroll={onTableHeaderScroll}
                className="no-scrollbar shrink-0 overflow-x-auto overflow-y-hidden border-b border-slate-200/80 dark:border-sky-500/20"
              >
                <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-sm">
                  <AdminProductsTableColgroup />
                  <thead className="bg-slate-100/92 backdrop-blur-md dark:bg-[#0f1a38]/95 dark:backdrop-blur-md">
                    <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      <SortHeader
                        label="Producto"
                        sortKey="name"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Tienda"
                        sortKey="store"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Categoría"
                        sortKey="category"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Precio"
                        sortKey="price"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Stock"
                        sortKey="stock"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Estado"
                        sortKey="active"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                        Acción
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div
                ref={tableBodyScrollRef}
                onScroll={onTableBodyScroll}
                className="market-scroll min-h-0 flex-1 overflow-x-auto overflow-y-auto"
              >
                <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-sm">
                  <AdminProductsTableColgroup />
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                        >
                          {products.length === 0
                            ? 'No hay productos registrados.'
                            : 'Ningún producto coincide con la búsqueda.'}
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-slate-200/55 transition-colors last:border-0 hover:bg-slate-50/90 dark:border-sky-500/[0.12] dark:hover:bg-sky-950/20"
                        >
                          <td className="px-4 py-2 align-middle">
                            <p className="font-medium leading-tight text-slate-900 dark:text-slate-100">
                              {p.name}
                            </p>
                            <p className="mt-0.5 text-xs leading-tight text-slate-500 dark:text-slate-500">
                              {p.slug}
                            </p>
                          </td>
                          <td className="px-4 py-2 align-middle text-slate-700 dark:text-slate-300">
                            {p.store?.name ?? '—'}
                          </td>
                          <td className="px-4 py-2 align-middle text-slate-700 dark:text-slate-300">
                            {p.category?.name ?? '—'}
                          </td>
                          <td className="px-4 py-2 align-middle tabular-nums text-slate-700 dark:text-slate-300">
                            {formatPrice(numOrZero(p.price))}
                          </td>
                          <td className="px-4 py-2 align-middle tabular-nums text-slate-700 dark:text-slate-300">
                            {p.stock}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            <span className="text-xs leading-tight">
                              {p.isActive ? (
                                <span className="text-[var(--color-forest)] dark:text-sky-400">
                                  Activo
                                </span>
                              ) : (
                                <span className="text-red-600 dark:text-red-400">
                                  Inactivo
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-2 align-middle text-center">
                            <div className="flex flex-nowrap items-center justify-center gap-1.5">
                              <Button
                                type="button"
                                variant="icon"
                                className="!text-[#2563eb] hover:bg-blue-500/10 dark:!text-sky-400 dark:hover:bg-sky-500/15"
                                aria-label={`Ver detalle de ${p.name}`}
                                onClick={() => {
                                  setMode('view');
                                  setViewProductId(p.id);
                                }}
                              >
                                <FiEye className="h-4 w-4" aria-hidden />
                              </Button>
                              <Button
                                type="button"
                                variant="icon"
                                className="!text-[#1d4ed8] hover:bg-blue-500/10 dark:!text-sky-300 dark:hover:bg-sky-500/15"
                                aria-label={`Editar ${p.name}`}
                                onClick={() => {
                                  setMode('edit');
                                  setViewProductId(p.id);
                                }}
                              >
                                <FiEdit2 className="h-4 w-4" aria-hidden />
                              </Button>
                              <Button
                                type="button"
                                variant="icon"
                                className="!text-red-600 hover:bg-red-500/10 dark:!text-red-400 dark:hover:bg-red-950/35"
                                disabled={deleteMut.isPending}
                                aria-label={`Eliminar ${p.name}`}
                                onClick={() => setProductToDelete(p)}
                              >
                                <FiTrash2 className="h-4 w-4" aria-hidden />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-3 border-t border-slate-200/80 bg-slate-50/75 px-4 py-3 backdrop-blur-sm dark:border-sky-500/18 dark:bg-[#0c1630]/88 dark:backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {filteredSorted.length === 0
                    ? '0 productos'
                    : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filteredSorted.length)} de ${filteredSorted.length}`}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Página{' '}
                  <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                    {page}
                  </span>{' '}
                  de{' '}
                  <span className="tabular-nums">{totalPages}</span>
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 min-w-8 px-2"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Página anterior"
                  >
                    <FiChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 min-w-8 px-2"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    aria-label="Página siguiente"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Por página</span>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={pageSize}
                    onChange={(e) => {
                      const raw = Number(e.target.value);
                      if (!Number.isFinite(raw)) return;
                      const next = Math.min(
                        999,
                        Math.max(1, Math.trunc(raw)),
                      );
                      setPageSize(next);
                    }}
                    className="page-size-input h-9 w-16 rounded-md border border-slate-300 bg-white px-2 text-center text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/25 dark:border-sky-500/30 dark:bg-[#0b1735] dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/25"
                    aria-label="Cantidad de elementos por página"
                  />
                </label>
              </div>
            </div>
          </div>

          <Modal
            open={viewProductId != null && mode === 'edit'}
            onClose={() => {
              setViewProductId(null);
              setMode('view');
            }}
            title={
              productDetailQuery.data?.name
                ? `Editar: ${productDetailQuery.data.name}`
                : 'Editar producto'
            }
          >
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              {productDetailQuery.isLoading ? (
                <p className="px-5 py-4 text-sm text-zinc-500">
                  Cargando detalle…
                </p>
              ) : productDetailQuery.isError ? (
                <p className="px-5 py-4 text-sm text-red-600">
                  No se pudo cargar el detalle del producto.
                </p>
              ) : productDetailQuery.data ? (
                <AdminEditProductForm
                  key={productDetailQuery.data.id}
                  product={productDetailQuery.data}
                  onSuccess={() => {
                    setViewProductId(null);
                    setMode('view');
                  }}
                  onCancel={() => {
                    setMode('view');
                  }}
                />
              ) : null}
            </div>
          </Modal>

          <ProductDetailsDrawer
            open={viewProductId != null && mode === 'view'}
            onClose={() => {
              setViewProductId(null);
              setMode('view');
            }}
            onEdit={() => setMode('edit')}
            onRequestDelete={openDeleteForViewedProduct}
            deleteDisabled={deleteMut.isPending}
            isLoading={productDetailQuery.isLoading}
            isError={productDetailQuery.isError}
            product={productDetailQuery.data}
          />

          <Modal
            open={productToDelete != null}
            onClose={() => setProductToDelete(null)}
            title="Confirmar eliminación"
          >
            <div className="space-y-4 px-5 py-4">
              <p className="text-sm text-zinc-700 dark:text-zinc-200">
                ¿Seguro que quieres eliminar el producto{' '}
                <span className="font-semibold">
                  «{productToDelete?.name}»
                </span>
                ?
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Se borrará de forma permanente. Si el producto consta en algún
                pedido, el sistema no permitirá eliminarlo.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50/90 px-5 py-4 dark:border-night-800 dark:bg-night-950/90">
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-40 justify-center border border-zinc-300 bg-white px-4 text-sm text-zinc-800 hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700"
                onClick={() => setProductToDelete(null)}
                disabled={deleteMut.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                className="h-10 w-40 justify-center border-0 bg-rose-700/90 px-4 text-sm text-white hover:bg-rose-800 dark:bg-rose-700/90 dark:hover:bg-rose-800"
                onClick={handleConfirmDelete}
                disabled={deleteMut.isPending}
              >
                {deleteMut.isPending ? 'Eliminando…' : 'Eliminar'}
              </Button>
            </div>
          </Modal>

          <Modal
            open={createProductOpen}
            onClose={() => setCreateProductOpen(false)}
            title="Nuevo producto"
          >
            <CreateProductForm
              onSuccess={() => setCreateProductOpen(false)}
              onCancel={() => setCreateProductOpen(false)}
            />
          </Modal>
        </div>
      )}
    </div>
  );
}
