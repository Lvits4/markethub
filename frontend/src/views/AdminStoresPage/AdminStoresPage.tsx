import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiEdit2,
  FiEye,
  FiMail,
  FiPhone,
  FiSearch,
  FiShoppingBag,
  FiTrash2,
  FiUser,
  FiX,
} from 'react-icons/fi';
import {
  AdminDetailCompactField,
  AdminDetailFieldsGrid,
  AdminDetailHeroSplit,
  AdminDetailImageFrame,
  AdminDetailPanelRoot,
  AdminDetailPanelTop,
  AdminDetailScrollSection,
  AdminDetailStatTile,
  AdminDetailStatsGrid,
  AdminDetailTextCard,
  AdminDetailTitleRow,
  getAdminStorePanelStats,
} from '../../components/AdminDetailPanel/AdminDetailPanel';
import { AdminStatusBadge } from '../../components/AdminStatusBadge/AdminStatusBadge';
import { Button } from '../../components/Button/Button';
import { Modal } from '../../components/Modal/Modal';
import { AdminEditStoreForm } from '../../components/AdminEditStoreForm/AdminEditStoreForm';
import { useSellerCreateStoreModal } from '../../context/SellerCreateStoreModalProvider/SellerCreateStoreModalProvider';
import { useAuth } from '../../hooks/useAuth';
import { useDeleteStoreMutation } from '../../hooks/useStoreMutations';
import { useProtectedImageSrc } from '../../hooks/useProtectedImageSrc';
import { formatPrice } from '../../helpers/formatPrice';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAdminDeleteStore } from '../../hooks/useAdminDeleteStore';
import { queryKeys } from '../../helpers/queryKeys';
import { useAdminStoreDetailQuery } from '../../queries/useAdminStoreDetailQuery';
import { useAdminStoresQuery } from '../../queries/useAdminStoresQuery';
import { useMyStoresQuery } from '../../queries/useMyStoresQuery';
import { useSellerStoreDetailQuery } from '../../queries/useSellerStoreDetailQuery';
import type { AdminStoreDetail, AdminStoreRow } from '../../types/admin';
import type { Store } from '../../types/store';

function mapMyStoreToAdminRow(s: Store): AdminStoreRow {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    contactEmail: s.contactEmail,
    contactPhone: s.contactPhone,
    isApproved: s.isApproved,
    isRejected: s.isRejected ?? false,
    isActive: s.isActive,
    commission: s.commission ?? 5,
    userId: s.userId,
  };
}

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

const DEFAULT_PAGE_SIZE = 10;

function AdminStoresTableColgroup({ isSeller }: { isSeller: boolean }) {
  if (isSeller) {
    return (
      <colgroup>
        <col style={{ width: '20%' }} />
        <col style={{ width: '22%' }} />
        <col style={{ width: '14%' }} />
        <col style={{ width: '24%' }} />
        <col style={{ width: '20%' }} />
      </colgroup>
    );
  }
  return (
    <colgroup>
      <col style={{ width: '14%' }} />
      <col style={{ width: '16%' }} />
      <col style={{ width: '17%' }} />
      <col style={{ width: '11%' }} />
      <col style={{ width: '20%' }} />
      <col style={{ width: '7%' }} />
      <col style={{ width: '15%' }} />
    </colgroup>
  );
}

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

function StoreDetailLogo({
  logo,
  imageClassName = 'max-h-28',
}: {
  logo: string | null;
  /** Clases Tailwind para el tamaño del logo (p. ej. `max-h-44` en panel). */
  imageClassName?: string;
}) {
  const { token } = useAuth();
  const { src, loading, error } = useProtectedImageSrc(logo, token);
  if (!logo?.trim()) {
    return <span className="text-slate-400 dark:text-slate-500">Sin logo</span>;
  }
  if (loading) {
    return <span className="text-slate-400 dark:text-slate-500">Cargando imagen…</span>;
  }
  if (error || !src) {
    return <span className="text-slate-400 dark:text-slate-500">No se pudo mostrar el logo</span>;
  }
  return (
    <img
      src={src}
      alt=""
      className={`mx-auto h-auto w-auto max-w-full object-contain ${imageClassName}`}
    />
  );
}

function StoreDetailsPanel({
  store,
  variant = 'admin',
}: {
  store: AdminStoreDetail;
  variant?: 'admin' | 'seller';
}) {
  const [detailTab, setDetailTab] = useState<'datos' | 'politicas'>('datos');
  const ownerName = store.user
    ? `${store.user.firstName} ${store.user.lastName}`.trim()
    : '';
  const st = getAdminStorePanelStats(store);
  const createdLabel = store.createdAt
    ? new Date(store.createdAt).toLocaleDateString('es', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';
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
              {variant === 'admin' ? (
                <span className="rounded border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300">
                  {numOrZero(store.commission)}% comisión
                </span>
              ) : null}
              {store.isRejected ? (
                <AdminStatusBadge tone="danger">Rechazada</AdminStatusBadge>
              ) : store.isApproved ? (
                <AdminStatusBadge tone="success">Aprobada</AdminStatusBadge>
              ) : (
                <AdminStatusBadge tone="warning">Pendiente</AdminStatusBadge>
              )}
              <AdminStatusBadge tone={store.isActive ? 'success' : 'danger'}>
                {store.isActive ? 'Activa' : 'Inactiva'}
              </AdminStatusBadge>
            </>
          }
        />

        <AdminDetailStatsGrid>
          <AdminDetailStatTile
            label="Productos"
            value={st.productsTotal}
            hint={`${st.productsActive} activos`}
          />
          <AdminDetailStatTile
            label="Pedidos"
            value={st.ordersTotal}
            hint={`${st.ordersDelivered} entregados`}
          />
          <AdminDetailStatTile
            label="Ventas (bruto)"
            value={formatPrice(st.revenue)}
            hint="excl. cancelados"
          />
          <AdminDetailStatTile label="Alta" value={createdLabel} hint="registro" />
        </AdminDetailStatsGrid>

        <AdminDetailHeroSplit
          image={
            <AdminDetailImageFrame ariaLabel="Logo de la tienda">
              <StoreDetailLogo
                logo={store.logo}
                imageClassName="max-h-full max-w-full object-contain rounded-md shadow-sm ring-1 ring-black/5 dark:ring-white/10"
              />
            </AdminDetailImageFrame>
          }
          fields={
            <AdminDetailFieldsGrid>
              {variant === 'admin' ? (
                <>
                  <AdminDetailCompactField label="Vendedor" icon={FiUser}>
                    {ownerName || '—'}
                  </AdminDetailCompactField>
                  <AdminDetailCompactField label="Correo vendedor" icon={FiMail}>
                    {store.user?.email ?? '—'}
                  </AdminDetailCompactField>
                </>
              ) : null}
              <AdminDetailCompactField label="Correo tienda" icon={FiMail}>
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

function StoreDetailsDrawer({
  open,
  onClose,
  isLoading,
  isError,
  store,
  variant = 'admin',
}: {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  isError: boolean;
  store?: AdminStoreDetail;
  variant?: 'admin' | 'seller';
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
      className="fixed inset-0 z-80 flex cursor-pointer items-stretch justify-end bg-black/35"
      role="presentation"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Detalle de tienda"
        className="flex h-full w-full max-w-[640px] cursor-default flex-col border-l border-slate-200/80 bg-white shadow-2xl dark:border-sky-500/20 dark:bg-[#0b152f]"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 dark:border-sky-500/20 dark:bg-[#0d1938]">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Panel de detalles
          </h2>
          <div className="flex items-center gap-2">
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
            <StoreDetailsPanel store={store} variant={variant} />
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

export function AdminStoresPage() {
  const { user } = useAuth();
  const isSeller = user?.role === 'SELLER';
  const colCount = isSeller ? 5 : 7;
  const queryClient = useQueryClient();
  const { openCreateStoreModal } = useSellerCreateStoreModal();
  const adminStoresQ = useAdminStoresQuery();
  const myStoresQ = useMyStoresQuery();
  const adminDelete = useAdminDeleteStore();
  const sellerDelete = useDeleteStoreMutation();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [viewStoreId, setViewStoreId] = useState<string | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<AdminStoreRow | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const adminDetailQ = useAdminStoreDetailQuery(viewStoreId);
  const sellerDetailQ = useSellerStoreDetailQuery(viewStoreId);
  const storeDetailQuery = isSeller ? sellerDetailQ : adminDetailQ;
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

  const isLoading = isSeller ? myStoresQ.isLoading : adminStoresQ.isLoading;
  const isError = isSeller ? myStoresQ.isError : adminStoresQ.isError;

  const stores = useMemo(() => {
    if (isSeller) {
      const raw = myStoresQ.data;
      return Array.isArray(raw) ? raw.map(mapMyStoreToAdminRow) : [];
    }
    const raw = adminStoresQ.data;
    return Array.isArray(raw) ? raw : [];
  }, [isSeller, myStoresQ.data, adminStoresQ.data]);

  const deletePending = isSeller
    ? sellerDelete.isPending
    : adminDelete.isPending;

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
    const id = storeToDelete.id;
    if (isSeller) {
      sellerDelete.mutate(id, {
        onSuccess: () => {
          toast.success('Tienda eliminada');
          setStoreToDelete(null);
          void queryClient.invalidateQueries({
            queryKey: queryKeys.sellerStore(id),
          });
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      });
      return;
    }
    adminDelete.mutate(id, {
      onSuccess: () => {
        toast.success('Tienda eliminada');
        setStoreToDelete(null);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h2 className="flex shrink-0 items-center gap-2.5 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        <FiShoppingBag className="h-7 w-7 shrink-0 text-zinc-900 dark:text-zinc-50" aria-hidden />
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
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isSeller
                    ? 'Buscar por tienda, slug, correo o teléfono…'
                    : 'Buscar por tienda, slug, correo, teléfono o vendedor…'
                }
                className={`box-border h-11 w-full rounded-md border border-zinc-200 bg-white py-0 pl-10 text-sm leading-normal text-zinc-900 shadow-sm ring-zinc-200 placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]/25 dark:border-night-700 dark:bg-night-950 dark:text-zinc-50 dark:ring-night-800 ${search ? 'pr-11' : 'pr-4'}`}
                aria-label="Buscar tiendas"
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
              variant="cta"
              className="h-11 min-h-11 shrink-0 px-6 py-0"
              onClick={() => openCreateStoreModal()}
            >
              Crear tienda
            </Button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-[#f4f7fc]/92 shadow-[0_8px_32px_rgb(15_23_42/0.07)] backdrop-blur-xl dark:border-sky-500/25 dark:bg-[#0a1228]/92 dark:shadow-[0_24px_56px_-16px_rgb(0_0_0/0.55),inset_0_1px_0_0_rgb(56_189_248/0.11)] dark:backdrop-blur-xl">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div
                ref={tableHeaderScrollRef}
                onScroll={onTableHeaderScroll}
                className="no-scrollbar shrink-0 overflow-x-auto overflow-y-hidden border-b border-slate-200/80 dark:border-sky-500/20"
              >
                <table className="table-fixed w-full min-w-[900px] border-collapse text-left text-sm">
                  <AdminStoresTableColgroup isSeller={isSeller} />
                  <thead className="bg-slate-100/92 backdrop-blur-md dark:bg-[#0f1a38]/95 dark:backdrop-blur-md">
                    <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      <SortHeader
                        label="Tienda"
                        sortKey="name"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      {!isSeller ? (
                        <SortHeader
                          label="Vendedor"
                          sortKey="vendor"
                          activeKey={sortKey}
                          dir={sortDir}
                          onSort={handleSort}
                        />
                      ) : null}
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
                      {!isSeller ? (
                        <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                          Comisión
                        </th>
                      ) : null}
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
                <table className="table-fixed w-full min-w-[900px] border-collapse text-left text-sm">
                  <AdminStoresTableColgroup isSeller={isSeller} />
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={colCount}
                          className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
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
                          <td className="px-4 py-2 align-middle">
                            <p className="font-medium leading-tight text-slate-900 dark:text-slate-100">
                              {s.name}
                            </p>
                            <p className="mt-0.5 text-xs leading-tight text-slate-500 dark:text-slate-500">
                              {s.slug}
                            </p>
                          </td>
                          {!isSeller ? (
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
                                '—'
                              )}
                            </td>
                          ) : null}
                          <td className="min-w-0 truncate px-4 py-2 align-middle text-slate-700 dark:text-slate-300">
                            {s.contactEmail ?? '—'}
                          </td>
                          <td className="px-4 py-2 align-middle text-slate-700 dark:text-slate-300">
                            {s.contactPhone ?? '—'}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            <div className="flex flex-wrap gap-2">
                              {s.isRejected ? (
                                <AdminStatusBadge tone="danger">
                                  Rechazada
                                </AdminStatusBadge>
                              ) : s.isApproved ? (
                                <AdminStatusBadge tone="success">
                                  Aprobada
                                </AdminStatusBadge>
                              ) : (
                                <AdminStatusBadge tone="warning">
                                  Pendiente
                                </AdminStatusBadge>
                              )}
                              <AdminStatusBadge
                                tone={s.isActive ? 'success' : 'danger'}
                              >
                                {s.isActive ? 'Activa' : 'Inactiva'}
                              </AdminStatusBadge>
                            </div>
                          </td>
                          {!isSeller ? (
                            <td className="whitespace-nowrap px-4 py-2 text-center align-middle text-slate-700 tabular-nums dark:text-slate-300">
                              {numOrZero(s.commission)}%
                            </td>
                          ) : null}
                          <td className="px-4 py-2 align-middle text-center">
                            <div className="flex flex-nowrap items-center justify-center gap-1.5">
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
                                className="!text-yellow-600 hover:bg-yellow-500/15 dark:!text-sky-300 dark:hover:bg-sky-500/15"
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
                                disabled={deletePending}
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
            </div>

            <div className="flex shrink-0 flex-col items-center gap-3 border-t border-slate-200/80 bg-slate-50/75 px-4 py-3 backdrop-blur-sm dark:border-sky-500/18 dark:bg-[#0c1630]/88 dark:backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {filteredSorted.length === 0
                    ? '0 tiendas'
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
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
                      const next = Math.min(999, Math.max(1, Math.trunc(raw)));
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
                    allowCommissionEdit={!isSeller}
                    onSuccess={() => {
                      setViewStoreId(null);
                      setMode('view');
                    }}
                    onCancel={() => {
                      setMode('view');
                    }}
                  />
                ) : (
                  <StoreDetailsPanel
                    store={storeDetailQuery.data}
                    variant={isSeller ? 'seller' : 'admin'}
                  />
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
            isLoading={storeDetailQuery.isLoading}
            isError={storeDetailQuery.isError}
            store={storeDetailQuery.data}
            variant={isSeller ? 'seller' : 'admin'}
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
                className="h-10 w-40 justify-center border border-zinc-300 bg-white px-4 text-sm text-zinc-800 hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700"
                onClick={() => setStoreToDelete(null)}
                disabled={deletePending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                className="h-10 w-40 justify-center border-0 bg-rose-700/90 px-4 text-sm text-white hover:bg-rose-800 dark:bg-rose-700/90 dark:hover:bg-rose-800"
                onClick={handleConfirmDelete}
                disabled={deletePending}
              >
                {deletePending ? 'Eliminando…' : 'Eliminar tienda'}
              </Button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
