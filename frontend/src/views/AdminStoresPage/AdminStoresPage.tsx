import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiEdit2,
  FiEye,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi';
import { Button } from '../../components/Button/Button';
import { Modal } from '../../components/Modal/Modal';
import { useSellerCreateStoreModal } from '../../context/SellerCreateStoreModalProvider/SellerCreateStoreModalProvider';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAdminDeleteStore } from '../../hooks/useAdminDeleteStore';
import { useAdminStoreDetailQuery } from '../../queries/useAdminStoreDetailQuery';
import { useAdminStoresQuery } from '../../queries/useAdminStoresQuery';
import type { AdminStoreRow } from '../../types/admin';

function numOrZero(v: string | number) {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

type SortKey =
  | 'name'
  | 'vendor'
  | 'status'
  | 'contactEmail'
  | 'contactPhone';

type SortDir = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

function vendorSortValue(s: AdminStoreRow): string {
  if (!s.user) return '';
  const n = `${s.user.firstName ?? ''} ${s.user.lastName ?? ''}`.trim();
  return (n || s.user.email || '').toLowerCase();
}

function statusSortValue(s: AdminStoreRow): number {
  const approved = s.isApproved ? 1 : 0;
  const active = s.isActive ? 1 : 0;
  return approved * 2 + active;
}

function compareStores(
  a: AdminStoreRow,
  b: AdminStoreRow,
  key: SortKey,
  dir: SortDir,
): number {
  let cmp = 0;
  switch (key) {
    case 'name':
      cmp = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      break;
    case 'vendor':
      cmp = vendorSortValue(a).localeCompare(vendorSortValue(b), 'es');
      break;
    case 'status':
      cmp = statusSortValue(a) - statusSortValue(b);
      break;
    case 'contactEmail':
      cmp = (a.contactEmail ?? '').localeCompare(b.contactEmail ?? '', 'es');
      break;
    case 'contactPhone':
      cmp = (a.contactPhone ?? '').localeCompare(b.contactPhone ?? '', 'es', {
        numeric: true,
      });
      break;
    default:
      cmp = 0;
  }
  return dir === 'asc' ? cmp : -cmp;
}

function matchesSearch(s: AdminStoreRow, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  const chunks = [
    s.name,
    s.slug,
    s.contactEmail,
    s.contactPhone,
    s.user?.email,
    s.user?.firstName,
    s.user?.lastName,
  ];
  return chunks.some((c) => (c ?? '').toLowerCase().includes(n));
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
      className={`px-5 py-3 ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <div
        className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}
      >
        <span>{label}</span>
        <span className="inline-flex shrink-0 flex-col gap-0">
          <button
            type="button"
            className={`rounded-md p-0.5 leading-none transition-colors hover:bg-zinc-200 dark:hover:bg-night-700 ${active && dir === 'asc' ? 'text-[var(--color-forest)] dark:text-blue-400' : 'text-zinc-400'}`}
            aria-label={`Ordenar ${label} ascendente`}
            onClick={() => onSort(sortKey, 'asc')}
          >
            <FiChevronUp className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            type="button"
            className={`-mt-1 rounded-md p-0.5 leading-none transition-colors hover:bg-zinc-200 dark:hover:bg-night-700 ${active && dir === 'desc' ? 'text-[var(--color-forest)] dark:text-blue-400' : 'text-zinc-400'}`}
            aria-label={`Ordenar ${label} descendente`}
            onClick={() => onSort(sortKey, 'desc')}
          >
            <FiChevronDown className="h-3.5 w-3.5" aria-hidden />
          </button>
        </span>
      </div>
    </th>
  );
}

export function AdminStoresPage() {
  const { openCreateStoreModal } = useSellerCreateStoreModal();
  const { data, isLoading, isError } = useAdminStoresQuery();
  const deleteStore = useAdminDeleteStore();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(
    PAGE_SIZE_OPTIONS[0],
  );
  const [viewStoreId, setViewStoreId] = useState<string | null>(null);
  const storeDetailQuery = useAdminStoreDetailQuery(viewStoreId);

  const stores = Array.isArray(data) ? data : [];

  const filteredSorted = useMemo(() => {
    const q = search.trim();
    const list = stores.filter((s) => matchesSearch(s, q));
    return [...list].sort((a, b) => compareStores(a, b, sortKey, sortDir));
  }, [stores, search, sortKey, sortDir]);

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

  const handleDelete = (s: AdminStoreRow) => {
    const ok = window.confirm(
      `¿Eliminar la tienda «${s.name}»? Se borrarán productos y pedidos asociados. Esta acción no se puede deshacer.`,
    );
    if (!ok) return;
    deleteStore.mutate(s.id, {
      onSuccess: () => {
        toast.success('Tienda eliminada');
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h2 className="shrink-0 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Tiendas
      </h2>

      {isLoading ? (
        <p className="text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="text-center text-sm text-red-600">
          No se pudieron cargar las tiendas.
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
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por tienda, slug, correo, teléfono o vendedor…"
                className="box-border h-11 w-full rounded-md border border-zinc-200 bg-white py-0 pl-10 pr-4 text-sm leading-normal text-zinc-900 shadow-sm ring-zinc-200 placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]/25 dark:border-night-700 dark:bg-night-950 dark:text-zinc-50 dark:ring-night-800"
                aria-label="Buscar tiendas"
              />
            </div>
            <Button
              type="button"
              variant="primary"
              className="h-11 min-h-11 shrink-0 border-0 px-6 py-0 text-sm !bg-[#102251] !text-[#458bde] shadow-sm hover:!bg-[#152a5e] focus-visible:!ring-2 focus-visible:!ring-[#458bde]/35 dark:!bg-[#102251] dark:!text-[#458bde] dark:hover:!bg-[#152a5e]"
              onClick={() => openCreateStoreModal()}
            >
              Crear tienda
            </Button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white/70 shadow-lg shadow-zinc-900/[0.06] backdrop-blur-xl dark:border-blue-500/15 dark:bg-night-900/55 dark:shadow-[0_24px_48px_-12px_rgb(0_0_0/0.45)] dark:backdrop-blur-xl">
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="sticky top-0 z-10 bg-zinc-100/85 backdrop-blur-md dark:bg-night-800/80 dark:backdrop-blur-md">
                  <tr className="border-b border-zinc-200/60 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-night-700/80 dark:text-zinc-400">
                    <SortHeader
                      label="Tienda"
                      sortKey="name"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <SortHeader
                      label="Vendedor"
                      sortKey="vendor"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <SortHeader
                      label="Correo tienda"
                      sortKey="contactEmail"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <SortHeader
                      label="Teléfono"
                      sortKey="contactPhone"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <SortHeader
                      label="Estado"
                      sortKey="status"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Comisión
                    </th>
                    <th className="px-5 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-sm text-zinc-500"
                      >
                        {stores.length === 0
                          ? 'No hay tiendas registradas.'
                          : 'Ninguna tienda coincide con la búsqueda.'}
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-zinc-200/40 last:border-0 dark:border-night-700/50"
                      >
                        <td className="px-5 py-3 align-top">
                          <p className="font-medium text-zinc-900 dark:text-zinc-50">
                            {s.name}
                          </p>
                          <p className="text-xs text-zinc-500">{s.slug}</p>
                        </td>
                        <td className="px-5 py-3 align-top text-zinc-600 dark:text-zinc-300">
                          {s.user ? (
                            <>
                              <p>
                                {s.user.firstName} {s.user.lastName}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {s.user.email}
                              </p>
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="max-w-[200px] truncate px-5 py-3 align-top text-zinc-600 dark:text-zinc-300">
                          {s.contactEmail ?? '—'}
                        </td>
                        <td className="px-5 py-3 align-top text-zinc-600 dark:text-zinc-300">
                          {s.contactPhone ?? '—'}
                        </td>
                        <td className="px-5 py-3 align-top">
                          <span className="text-xs">
                            {s.isApproved ? (
                              <span className="text-[var(--color-forest)] dark:text-blue-400">
                                Aprobada
                              </span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400">
                                Pendiente / rechazada
                              </span>
                            )}
                            {s.isActive ? null : (
                              <span className="ml-2 text-red-600 dark:text-red-400">
                                (inactiva)
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-3 align-top text-zinc-600 tabular-nums dark:text-zinc-300">
                          {numOrZero(s.commission)}%
                        </td>
                        <td className="px-5 py-3 align-top text-right">
                          <div className="flex flex-wrap items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="icon"
                              className="text-[#458bde] hover:bg-blue-50 dark:text-[#458bde] dark:hover:bg-blue-950/35"
                              aria-label={`Ver detalle de ${s.name}`}
                              onClick={() => setViewStoreId(s.id)}
                            >
                              <FiEye className="h-4 w-4" aria-hidden />
                            </Button>
                            <Button
                              type="button"
                              variant="icon"
                              className="text-[var(--color-forest)] hover:bg-zinc-100 dark:text-blue-400 dark:hover:bg-night-800"
                              aria-label={`Editar ${s.name}`}
                              onClick={() => setViewStoreId(s.id)}
                            >
                              <FiEdit2 className="h-4 w-4" aria-hidden />
                            </Button>
                            <Button
                              type="button"
                              variant="icon"
                              className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                              disabled={deleteStore.isPending}
                              aria-label={`Eliminar ${s.name}`}
                              onClick={() => handleDelete(s)}
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

            <div className="flex shrink-0 flex-col gap-3 border-t border-zinc-200/60 bg-zinc-50/50 px-4 py-3 backdrop-blur-sm dark:border-night-700/80 dark:bg-night-800/40 dark:backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-zinc-500">
                {filteredSorted.length === 0
                  ? '0 tiendas'
                  : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filteredSorted.length)} de ${filteredSorted.length}`}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-zinc-500">
                  <span>Por página</span>
                  <select
                    value={pageSize}
                    onChange={(e) =>
                      setPageSize(
                        Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number],
                      )
                    }
                    className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-night-700 dark:bg-night-950 dark:text-zinc-50"
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
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
                  <span className="min-w-[4.5rem] text-center text-xs text-zinc-600 dark:text-zinc-400">
                    {page} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 min-w-8 px-2"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Página siguiente"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Modal
            open={viewStoreId != null}
            onClose={() => setViewStoreId(null)}
            title={
              storeDetailQuery.data?.name
                ? `Tienda: ${storeDetailQuery.data.name}`
                : 'Detalle de tienda'
            }
            wide
          >
            <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
              {storeDetailQuery.isLoading ? (
                <p className="text-sm text-zinc-500">Cargando detalle…</p>
              ) : storeDetailQuery.isError ? (
                <p className="text-sm text-red-600">
                  No se pudo cargar el detalle de la tienda.
                </p>
              ) : storeDetailQuery.data ? (
                <pre className="whitespace-pre-wrap break-words rounded-md bg-zinc-50 p-4 font-mono text-xs text-zinc-800 dark:bg-night-950 dark:text-zinc-200">
                  {JSON.stringify(storeDetailQuery.data, null, 2)}
                </pre>
              ) : null}
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
