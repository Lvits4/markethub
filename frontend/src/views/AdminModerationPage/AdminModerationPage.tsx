import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import {
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiMail,
  FiPhone,
  FiSearch,
  FiUser,
  FiX,
  FiXCircle,
} from 'react-icons/fi';
import {
  AdminDetailCompactField,
  AdminDetailFieldsGrid,
  AdminDetailHeroSplit,
  AdminDetailImageFrame,
  AdminDetailPanelRoot,
  AdminDetailPanelTop,
  AdminDetailScrollSection,
  AdminDetailTextCard,
  AdminDetailTitleRow,
} from '../../components/AdminDetailPanel/AdminDetailPanel';
import { AdminDrawerWrapper } from '../../components/AdminDrawerWrapper/AdminDrawerWrapper';
import { AdminStatusBadge } from '../../components/AdminStatusBadge/AdminStatusBadge';
import { Button } from '../../components/Button/Button';
import { TablePagination } from '../../components/TablePagination/TablePagination';
import {
  TableEmptyCell,
} from '../../components/TableEmptyCell/TableEmptyCell';
import { getErrorMessage } from '../../helpers/mapApiError/mapApiError';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { useProtectedImageSrc } from '../../hooks/useProtectedImageSrc/useProtectedImageSrc';
import { useStoreApprove, useStoreReject } from '../../hooks/useStoreModeration/useStoreModeration';
import { useAdminStoreDetailQuery } from '../../queries/useAdminStoreDetailQuery/useAdminStoreDetailQuery';
import { useRejectedStoresQuery } from '../../queries/useRejectedStoresQuery/useRejectedStoresQuery';
import type { AdminStoreDetail, AdminStoreRow } from '../../types/admin/admin';

function numOrZero(v: string | number) {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

type SortKey = 'name' | 'vendor' | 'contactEmail';
type SortDir = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 10;
const NUM_DATA_COLS = 5;
const ROW_NUM_WIDTH = '3.5%';
const COL_WIDTH = `${(100 - 3.5) / NUM_DATA_COLS}%`;

function ModerationTableColgroup() {
  return (
    <colgroup>
      <col style={{ width: ROW_NUM_WIDTH }} />
      {Array.from({ length: NUM_DATA_COLS }, (__, i) => (
        <col key={i} style={{ width: COL_WIDTH }} />
      ))}
    </colgroup>
  );
}

function vendorSortValue(s: AdminStoreRow): string {
  if (!s.user) return '';
  const n = `${s.user.firstName ?? ''} ${s.user.lastName ?? ''}`.trim();
  return (n || s.user.email || '').toLowerCase();
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
    case 'contactEmail':
      cmp = (a.contactEmail ?? '').localeCompare(b.contactEmail ?? '', 'es');
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

function StoreDetailLogo({ logo }: { logo: string | null }) {
  const { token } = useAuth();
  const { src, loading, error } = useProtectedImageSrc(logo, token);
  if (!logo?.trim()) {
    return <span className="text-slate-400 dark:text-slate-500">Sin logo</span>;
  }
  if (loading) {
    return (
      <span className="text-slate-400 dark:text-slate-500">Cargando imagen…</span>
    );
  }
  if (error || !src) {
    return (
      <span className="text-slate-400 dark:text-slate-500">
        No se pudo mostrar el logo
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className="max-h-full max-w-full object-contain rounded-md shadow-sm ring-1 ring-black/5 dark:ring-white/10"
    />
  );
}

function StoreDetailsPanel({ store }: { store: AdminStoreDetail }) {
  const [detailTab, setDetailTab] = useState<'datos' | 'politicas'>('datos');
  const ownerName = store.user
    ? `${store.user.firstName} ${store.user.lastName}`.trim()
    : '';
  const descText = store.description?.trim() || 'Sin descripción';
  const shipText = store.shippingPolicy?.trim() || 'No definida';
  const retText = store.returnPolicy?.trim() || 'No definida';

  return (
    <AdminDetailPanelRoot>
      <AdminDetailPanelTop>
        <AdminDetailTitleRow
          title={store.name}
          subtitle={`/${store.slug}`}
          badges={
            <>
              <span className="rounded-md border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                {numOrZero(store.commission)}% comisión
              </span>
              <AdminStatusBadge tone="warning">
                Pendiente de aprobación
              </AdminStatusBadge>
            </>
          }
        />

        <AdminDetailHeroSplit
          image={
            <AdminDetailImageFrame ariaLabel="Logo de la tienda">
              <StoreDetailLogo logo={store.logo} />
            </AdminDetailImageFrame>
          }
          fields={
            <AdminDetailFieldsGrid>
              <AdminDetailCompactField label="Cliente" icon={FiUser}>
                {ownerName || '—'}
              </AdminDetailCompactField>
              <AdminDetailCompactField label="Correo" icon={FiMail}>
                {store.user?.email ?? '—'}
              </AdminDetailCompactField>
              <AdminDetailCompactField label="Correo" icon={FiMail}>
                {store.contactEmail ?? '—'}
              </AdminDetailCompactField>
              <AdminDetailCompactField label="Teléfono" icon={FiPhone}>
                {store.contactPhone ?? '—'}
              </AdminDetailCompactField>
            </AdminDetailFieldsGrid>
          }
        />
      </AdminDetailPanelTop>

      <AdminDetailScrollSection
        tablistLabel="Datos y políticas"
        tabs={[
          { id: 'datos', label: 'Datos' },
          { id: 'politicas', label: 'Políticas' },
        ]}
        activeTab={detailTab}
        onTabChange={(id) => setDetailTab(id as 'datos' | 'politicas')}
      >
        {detailTab === 'datos' ? (
          <div className="space-y-3 pb-1">
            <AdminDetailTextCard title="Descripción">{descText}</AdminDetailTextCard>
          </div>
        ) : (
          <div className="space-y-3 pb-1">
            <AdminDetailTextCard title="Política de envíos">
              {shipText}
            </AdminDetailTextCard>
            <AdminDetailTextCard title="Política de devoluciones">
              {retText}
            </AdminDetailTextCard>
          </div>
        )}
      </AdminDetailScrollSection>
    </AdminDetailPanelRoot>
  );
}

function ModerationDrawer({
  open,
  onClose,
  isLoading,
  isError,
  store,
}: {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  isError: boolean;
  store?: AdminStoreDetail;
}) {
  return (
    <AdminDrawerWrapper open={open} onClose={onClose} ariaLabel="Detalle de tienda pendiente">
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 dark:border-blue-500/15 dark:bg-admin-drawer-head">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Panel de detalles
        </h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="icon"
            className="h-8 w-8 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-blue-500/15"
            aria-label="Cerrar panel"
            onClick={onClose}
          >
            <FiX className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden bg-admin-canvas dark:bg-admin-canvas-dark">
        {isLoading ? (
          <p className="px-4 py-4 text-sm text-slate-500">
            Cargando detalle…
          </p>
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
    </AdminDrawerWrapper>
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
        <span className="inline-flex shrink-0 flex-col items-center gap-0 leading-none">
          <button
            type="button"
            className={`rounded p-0 leading-none transition-colors hover:bg-slate-200 dark:hover:bg-white/10 ${active && dir === 'asc' ? 'text-forest' : 'text-slate-400 dark:text-slate-500'}`}
            aria-label={`Ordenar ${label} ascendente`}
            onClick={() => onSort(sortKey, 'asc')}
          >
            <FiChevronUp className="h-3 w-3" aria-hidden />
          </button>
          <button
            type="button"
            className={`rounded p-0 leading-none transition-colors hover:bg-slate-200 dark:hover:bg-white/10 ${active && dir === 'desc' ? 'text-forest' : 'text-slate-400 dark:text-slate-500'}`}
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

export function AdminModerationPage() {
  const { data, isLoading, isError } = useRejectedStoresQuery();
  const approve = useStoreApprove();
  const reject = useStoreReject();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [viewStoreId, setViewStoreId] = useState<string | null>(null);

  const storeDetailQuery = useAdminStoreDetailQuery(viewStoreId);

  const busy = approve.isPending || reject.isPending;

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

  const onApprove = (id: string) => {
    approve.mutate(id, {
      onSuccess: () => {
        toast.success('Tienda aprobada');
        if (viewStoreId === id) setViewStoreId(null);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  const onReject = (id: string) => {
    reject.mutate(id, {
      onSuccess: () => {
        toast.success('Tienda rechazada');
        if (viewStoreId === id) setViewStoreId(null);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {isLoading ? (
        <p className="text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="text-center text-sm text-red-600">
          No se pudo cargar la cola de moderación.
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
                placeholder="Buscar por nombre, correo o cliente…"
                className={`box-border h-11 w-full rounded-md border border-zinc-200 bg-white py-0 pl-10 text-sm leading-normal text-zinc-900 shadow-sm ring-zinc-200 placeholder:text-zinc-400 focus:border-forest focus:outline-hidden focus:ring-2 focus:ring-forest/25 dark:border-night-700 dark:bg-night-950 dark:text-zinc-50 dark:ring-night-800 ${search ? 'pr-11' : 'pr-4'}`}
                aria-label="Buscar tiendas pendientes"
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
          </div>

          <div className="admin-table-panel">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div
                ref={tableHeaderScrollRef}
                onScroll={onTableHeaderScroll}
                className="no-scrollbar shrink-0 overflow-x-auto overflow-y-hidden border-b border-slate-200/80 dark:border-blue-500/15"
              >
                <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-sm">
                  <ModerationTableColgroup />
                  <thead className="bg-slate-100/92 backdrop-blur-md dark:bg-admin-elevated/95 dark:backdrop-blur-md">
            <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              <th className="w-10 px-2 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                #
              </th>
              <SortHeader
label="Nombre"
              sortKey="name"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
label="Cliente"
              sortKey="vendor"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Correo"
                        sortKey="contactEmail"
                        activeKey={sortKey}
                        dir={sortDir}
          onSort={handleSort}
        />
        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          Teléfono
        </th>
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
                className="market-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto"
              >
                <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-sm">
                  <ModerationTableColgroup />
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
              <td
                    colSpan={NUM_DATA_COLS + 1}
                          className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                        >
                          {stores.length === 0
                            ? 'No hay tiendas pendientes de aprobación.'
                            : 'Ninguna tienda coincide con la búsqueda.'}
                        </td>
                      </tr>
                    ) : (
              pageRows.map((s, idx) => (
            <tr
              key={s.id}
              className="border-b border-slate-200/55 transition-colors last:border-0 hover:bg-slate-50/90 dark:border-blue-500/10 dark:hover:bg-white/6"
            >
              <td className="w-10 px-2 py-2 text-center align-middle tabular-nums text-slate-400 dark:text-slate-500">
                {(page - 1) * pageSize + idx + 1}
              </td>
              <td className="px-4 py-2 align-middle">
                            <p className="font-medium leading-tight text-slate-900 dark:text-slate-100">
                              {s.name}
                            </p>
                            <p className="mt-0.5 text-xs leading-tight text-slate-500 dark:text-slate-500">
                              {s.slug}
                            </p>
                          </td>
                          <td className="px-4 py-2 align-middle text-slate-700 dark:text-slate-300">
                            {s.user ? (
                              <>
                                <p className="leading-tight">
                                  {s.user.firstName} {s.user.lastName}
                                </p>
                                <p className="mt-0.5 text-xs leading-tight text-slate-500 dark:text-slate-500">
                                  {s.user.email}
                                </p>
                              </>
                            ) : (
                              <TableEmptyCell />
                            )}
                          </td>
                          <td className="min-w-0 truncate px-4 py-2 align-middle text-slate-700 dark:text-slate-300">
                            {s.contactEmail ?? <TableEmptyCell />}
                          </td>
                          <td className="px-4 py-2 align-middle text-slate-700 dark:text-slate-300">
        {s.contactPhone ?? <TableEmptyCell />}
      </td>
      <td className="px-4 py-2 align-middle text-center">
                            <div className="flex flex-nowrap items-center justify-center gap-1.5">
                              <Button
                                type="button"
                                variant="icon"
                                className="text-blue-600! hover:bg-blue-500/10 dark:text-blue-400! dark:hover:bg-blue-500/12"
                                aria-label={`Ver detalle de ${s.name}`}
                                onClick={() => setViewStoreId(s.id)}
                              >
                                <FiEye className="h-4 w-4" aria-hidden />
                              </Button>
                              <Button
                                type="button"
                                variant="icon"
                                className="text-emerald-600! hover:bg-emerald-500/10 dark:text-forest! dark:hover:bg-white/10"
                                aria-label={`Aprobar ${s.name}`}
                                disabled={busy}
                                onClick={() => onApprove(s.id)}
                              >
                                <FiCheck className="h-4 w-4" aria-hidden />
                              </Button>
                              <Button
                                type="button"
                                variant="icon"
                                className="text-red-600! hover:bg-red-500/10 dark:text-red-400! dark:hover:bg-red-950/35"
                                aria-label={`Rechazar ${s.name}`}
                                disabled={busy}
                                onClick={() => onReject(s.id)}
                              >
                                <FiXCircle className="h-4 w-4" aria-hidden />
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

          <TablePagination
            totalItems={filteredSorted.length}
            page={page}
            pageSize={pageSize}
      totalPages={totalPages}
        onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
          </div>

          <ModerationDrawer
            open={viewStoreId != null}
            onClose={() => setViewStoreId(null)}
            isLoading={storeDetailQuery.isLoading}
            isError={storeDetailQuery.isError}
            store={storeDetailQuery.data}
          />
        </div>
      )}
    </div>
  );
}
