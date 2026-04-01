import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiEdit2,
  FiEye,
  FiHash,
  FiMail,
  FiPhone,
  FiSearch,
  FiTrash2,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { Button } from '../../components/Button/Button';
import { Modal } from '../../components/Modal/Modal';
import { AdminEditStoreForm } from '../../components/AdminEditStoreForm/AdminEditStoreForm';
import { useSellerCreateStoreModal } from '../../context/SellerCreateStoreModalProvider/SellerCreateStoreModalProvider';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAdminDeleteStore } from '../../hooks/useAdminDeleteStore';
import { useAdminStoreDetailQuery } from '../../queries/useAdminStoreDetailQuery';
import { useAdminStoresQuery } from '../../queries/useAdminStoresQuery';
import type { AdminStoreDetail, AdminStoreRow } from '../../types/admin';

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

function statusChipClass(isActive: boolean) {
  return isActive
    ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/35 dark:bg-emerald-500/10 dark:text-emerald-300'
    : 'border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-500/35 dark:bg-rose-500/10 dark:text-rose-300';
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

function StoreDetailsPanel({ store }: { store: AdminStoreDetail }) {
  const ownerName = store.user
    ? `${store.user.firstName} ${store.user.lastName}`.trim()
    : '';

  return (
    <div className="market-scroll min-h-0 flex-1 overflow-y-auto px-4 py-3">
      <div className="space-y-4">
        <section className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {store.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">/{store.slug}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300">
              Comisión {numOrZero(store.commission)}%
            </span>
            <span
              className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${statusChipClass(store.isApproved)}`}
            >
              {store.isApproved ? 'Aprobada' : 'Pendiente'}
            </span>
            <span
              className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${statusChipClass(store.isActive)}`}
            >
              {store.isActive ? 'Activa' : 'Inactiva'}
            </span>
            {store.isRejected ? (
              <span className="rounded border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-500/35 dark:bg-amber-500/10 dark:text-amber-300">
                Rechazada
              </span>
            ) : null}
          </div>
        </section>

        <section className="space-y-2 border-t border-slate-200/80 pt-3 dark:border-sky-500/20">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Contacto
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            <DetailField label="Vendedor">
              <span className="inline-flex items-center gap-1.5">
                <FiUser className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                {ownerName || '—'}
              </span>
            </DetailField>
            <DetailField label="Correo vendedor">
              {store.user?.email ?? '—'}
            </DetailField>
            <DetailField label="Correo tienda">
              <span className="inline-flex items-center gap-1.5">
                <FiMail className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                {store.contactEmail ?? '—'}
              </span>
            </DetailField>
            <DetailField label="Teléfono">
              <span className="inline-flex items-center gap-1.5">
                <FiPhone className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                {store.contactPhone ?? '—'}
              </span>
            </DetailField>
          </div>
        </section>

        <section className="space-y-2 border-t border-slate-200/80 pt-3 dark:border-sky-500/20">
          <div className="inline-flex rounded-md bg-slate-100 p-0.5 dark:bg-[#0f1a38]">
            <span className="rounded bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-[#162647] dark:text-slate-100">
              Datos
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Políticas
            </span>
          </div>
          <DetailField label="Descripción">
            {store.description || 'Sin descripción'}
          </DetailField>
          <DetailField label="Política de envíos">
            {store.shippingPolicy || 'No definida'}
          </DetailField>
          <DetailField label="Política de devoluciones">
            {store.returnPolicy || 'No definida'}
          </DetailField>
        </section>

      </div>
    </div>
  );
}

function StoreDetailsDrawer({
  open,
  onClose,
  onEdit,
  isLoading,
  isError,
  store,
}: {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  isLoading: boolean;
  isError: boolean;
  store?: AdminStoreDetail;
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
        aria-label="Detalle de tienda"
        className="flex h-full w-full max-w-[640px] flex-col border-l border-slate-200/80 bg-white shadow-2xl dark:border-sky-500/20 dark:bg-[#0b152f]"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 dark:border-sky-500/20 dark:bg-[#0d1938]">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Details
          </h2>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-8 px-3 text-xs"
              onClick={onEdit}
              disabled={!store}
            >
              Editar
            </Button>
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
            <p className="px-4 py-4 text-sm text-slate-500">Cargando detalle…</p>
          ) : isError ? (
            <p className="px-4 py-4 text-sm text-red-600">
              No se pudo cargar el detalle de la tienda.
            </p>
          ) : store ? (
            <StoreDetailsPanel store={store} />
          ) : (
            <p className="px-4 py-4 text-sm text-slate-500">
              No hay datos de la tienda.
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
      className={`px-5 py-3 ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <div
        className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}
      >
        <span>{label}</span>
        <span className="inline-flex shrink-0 flex-col gap-0">
          <button
            type="button"
            className={`rounded-md p-0.5 leading-none transition-colors hover:bg-slate-200 dark:hover:bg-sky-950/50 ${active && dir === 'asc' ? 'text-[var(--color-forest)] dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`}
            aria-label={`Ordenar ${label} ascendente`}
            onClick={() => onSort(sortKey, 'asc')}
          >
            <FiChevronUp className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            type="button"
            className={`-mt-1 rounded-md p-0.5 leading-none transition-colors hover:bg-slate-200 dark:hover:bg-sky-950/50 ${active && dir === 'desc' ? 'text-[var(--color-forest)] dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`}
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
  const [storeToDelete, setStoreToDelete] = useState<AdminStoreRow | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
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

  const handleConfirmDelete = () => {
    if (!storeToDelete) return;
    deleteStore.mutate(storeToDelete.id, {
      onSuccess: () => {
        toast.success('Tienda eliminada');
        setStoreToDelete(null);
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

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-[#f4f7fc]/92 shadow-[0_8px_32px_rgb(15_23_42/0.07)] backdrop-blur-xl dark:border-sky-500/25 dark:bg-[#0a1228]/92 dark:shadow-[0_24px_56px_-16px_rgb(0_0_0/0.55),inset_0_1px_0_0_rgb(56_189_248/0.11)] dark:backdrop-blur-xl">
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-slate-200/80 bg-slate-100/92 backdrop-blur-md dark:border-sky-500/20 dark:bg-[#0f1a38]/95 dark:backdrop-blur-md">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
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
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Comisión
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
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
                        className="border-b border-slate-200/55 transition-colors last:border-0 hover:bg-slate-50/90 dark:border-sky-500/[0.12] dark:hover:bg-sky-950/20"
                      >
                        <td className="px-5 py-3 align-top">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {s.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            {s.slug}
                          </p>
                        </td>
                        <td className="px-5 py-3 align-top text-slate-700 dark:text-slate-300">
                          {s.user ? (
                            <>
                              <p>
                                {s.user.firstName} {s.user.lastName}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-500">
                                {s.user.email}
                              </p>
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="max-w-[200px] truncate px-5 py-3 align-top text-slate-700 dark:text-slate-300">
                          {s.contactEmail ?? '—'}
                        </td>
                        <td className="px-5 py-3 align-top text-slate-700 dark:text-slate-300">
                          {s.contactPhone ?? '—'}
                        </td>
                        <td className="px-5 py-3 align-top">
                          <span className="text-xs">
                            {s.isApproved ? (
                              <span className="text-[var(--color-forest)] dark:text-sky-400">
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
                        <td className="px-5 py-3 align-top text-slate-700 tabular-nums dark:text-slate-300">
                          {numOrZero(s.commission)}%
                        </td>
                        <td className="px-5 py-3 align-top text-right">
                          <div className="flex flex-wrap items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="icon"
                              className="!text-[#2563eb] hover:bg-blue-500/10 dark:!text-sky-400 dark:hover:bg-sky-500/15"
                              aria-label={`Ver detalle de ${s.name}`}
                              onClick={() => {
                                setMode('view');
                                setViewStoreId(s.id);
                              }}
                            >
                              <FiEye className="h-4 w-4" aria-hidden />
                            </Button>
                            <Button
                              type="button"
                              variant="icon"
                              className="!text-[#1d4ed8] hover:bg-blue-500/10 dark:!text-sky-300 dark:hover:bg-sky-500/15"
                              aria-label={`Editar ${s.name}`}
                              onClick={() => {
                                setMode('edit');
                                setViewStoreId(s.id);
                              }}
                            >
                              <FiEdit2 className="h-4 w-4" aria-hidden />
                            </Button>
                            <Button
                              type="button"
                              variant="icon"
                              className="!text-red-600 hover:bg-red-500/10 dark:!text-red-400 dark:hover:bg-red-950/35"
                              disabled={deleteStore.isPending}
                              aria-label={`Eliminar ${s.name}`}
                              onClick={() => setStoreToDelete(s)}
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

            <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200/80 bg-slate-50/75 px-4 py-3 backdrop-blur-sm dark:border-sky-500/18 dark:bg-[#0c1630]/88 dark:backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {filteredSorted.length === 0
                  ? '0 tiendas'
                  : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filteredSorted.length)} de ${filteredSorted.length}`}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Por página</span>
                  <select
                    value={pageSize}
                    onChange={(e) =>
                      setPageSize(
                        Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number],
                      )
                    }
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 dark:border-sky-500/25 dark:bg-[#0f1a32] dark:text-slate-100"
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
                  <span className="min-w-[4.5rem] text-center text-xs text-slate-600 dark:text-slate-400">
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
            open={viewStoreId != null && mode === 'edit'}
            onClose={() => {
              setViewStoreId(null);
              setMode('view');
            }}
            title={
              storeDetailQuery.data?.name
                ? mode === 'edit'
                  ? `Editar: ${storeDetailQuery.data.name}`
                  : `Detalle: ${storeDetailQuery.data.name}`
                : mode === 'edit'
                  ? 'Editar tienda'
                  : 'Detalle de tienda'
            }
          >
            <div className="min-h-0 flex-1 overflow-hidden">
              {storeDetailQuery.isLoading ? (
                <p className="px-5 py-4 text-sm text-zinc-500">Cargando detalle…</p>
              ) : storeDetailQuery.isError ? (
                <p className="px-5 py-4 text-sm text-red-600">
                  No se pudo cargar el detalle de la tienda.
                </p>
              ) : storeDetailQuery.data ? (
                mode === 'edit' ? (
                  <AdminEditStoreForm
                    store={storeDetailQuery.data}
                    onSuccess={() => {
                      setViewStoreId(null);
                      setMode('view');
                    }}
                    onCancel={() => {
                      setMode('view');
                    }}
                  />
                ) : (
                  <StoreDetailsPanel store={storeDetailQuery.data} />
                )
              ) : null}
            </div>
          </Modal>
          <StoreDetailsDrawer
            open={viewStoreId != null && mode === 'view'}
            onClose={() => {
              setViewStoreId(null);
              setMode('view');
            }}
            onEdit={() => setMode('edit')}
            isLoading={storeDetailQuery.isLoading}
            isError={storeDetailQuery.isError}
            store={storeDetailQuery.data}
          />
          <Modal
            open={storeToDelete != null}
            onClose={() => setStoreToDelete(null)}
            title="Confirmar eliminación"
          >
            <div className="space-y-4 px-5 py-4">
              <p className="text-sm text-zinc-700 dark:text-zinc-200">
                ¿Seguro que quieres eliminar la tienda{' '}
                <span className="font-semibold">«{storeToDelete?.name}»</span>?
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Esta acción eliminará también productos y pedidos asociados. No se
                puede deshacer.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50/90 px-5 py-4 dark:border-night-800 dark:bg-night-950/90">
              <Button
                type="button"
                variant="ghost"
                className="h-10 border border-zinc-300 bg-white px-4 text-sm text-zinc-800 hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700"
                onClick={() => setStoreToDelete(null)}
                disabled={deleteStore.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                className="h-10 border-0 bg-red-600 px-4 text-sm text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                onClick={handleConfirmDelete}
                disabled={deleteStore.isPending}
              >
                {deleteStore.isPending ? 'Eliminando…' : 'Eliminar tienda'}
              </Button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
