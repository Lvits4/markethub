import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiEdit2,
  FiEye,
  FiMail,
  FiMapPin,
  FiSearch,
  FiShoppingBag,
  FiShoppingCart,
  FiUser,
  FiX,
} from 'react-icons/fi';
import {
  AdminDetailCompactField,
  AdminDetailCompactFieldBlock,
  AdminDetailFieldsGrid,
  AdminDetailHeroSplit,
  AdminDetailImageFrame,
  AdminDetailPanelRoot,
  AdminDetailPanelTop,
  AdminDetailScrollSection,
  AdminDetailStatTile,
  AdminDetailStatsGrid,
  AdminDetailTitleRow,
} from '../../components/AdminDetailPanel/AdminDetailPanel';
import {
  AdminStatusBadge,
  orderStatusTone,
} from '../../components/AdminStatusBadge/AdminStatusBadge';
import { Button } from '../../components/Button/Button';
import {
  renderTableCellString,
  TableEmptyCell,
} from '../../components/TableEmptyCell/TableEmptyCell';
import { Modal } from '../../components/Modal/Modal';
import { AdminEditOrderForm } from '../../components/AdminEditOrderForm/AdminEditOrderForm';
import { formatOrderStatus } from '../../helpers/orderStatus';
import { formatPrice } from '../../helpers/formatPrice';
import { useAuth } from '../../hooks/useAuth';
import { useAdminOrdersQuery } from '../../queries/useAdminOrdersQuery';
import { useOrderDetailQuery } from '../../queries/useOrderDetailQuery';
import { useStoreOrdersSellerQuery } from '../../queries/useStoreOrdersSellerQuery';
import type { AdminOrderRow } from '../../types/admin';
import type { Order } from '../../types/order';

function numAmount(v: string | number) {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

type SortKey = 'date' | 'client' | 'store' | 'total' | 'status';
type SortDir = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 10;
const NUM_COLS = 6;
/** Anchos: Total queda en el hueco entre Tienda y Estado, con contenido centrado. */
const ORDER_TABLE_COL_WIDTHS = [
  '11%',
  '21%',
  '26%',
  '14%',
  '18%',
  '10%',
] as const;

function orderToAdminRow(
  o: Order & { createdAt?: string; updatedAt?: string },
): AdminOrderRow {
  return {
    id: o.id,
    status: o.status,
    totalAmount: o.totalAmount,
    shippingAddress: o.shippingAddress,
    userId: o.userId,
    storeId: o.storeId,
    user: o.user,
    store: o.store,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    items: o.items?.map((item, i) => ({
      id: item.id ?? `${item.productId}-${i}`,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      productId: item.productId,
      product: item.product
        ? { id: item.product.id, name: item.product.name }
        : undefined,
    })),
  };
}

function OrdersTableColgroup() {
  return (
    <colgroup>
      {ORDER_TABLE_COL_WIDTHS.map((width, i) => (
        <col key={i} style={{ width }} />
      ))}
    </colgroup>
  );
}

function clientSortValue(o: AdminOrderRow): string {
  if (!o.user) return '';
  const n = `${o.user.firstName ?? ''} ${o.user.lastName ?? ''}`.trim();
  return (n || o.user.email || '').toLowerCase();
}

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: 4,
};

function compareOrders(
  a: AdminOrderRow,
  b: AdminOrderRow,
  key: SortKey,
  dir: SortDir,
): number {
  let cmp = 0;
  switch (key) {
    case 'date':
      cmp = (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
      break;
    case 'client':
      cmp = clientSortValue(a).localeCompare(clientSortValue(b), 'es');
      break;
    case 'store':
      cmp = (a.store?.name ?? '').localeCompare(b.store?.name ?? '', 'es', {
        sensitivity: 'base',
      });
      break;
    case 'total':
      cmp = numAmount(a.totalAmount) - numAmount(b.totalAmount);
      break;
    case 'status':
      cmp =
        (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
      break;
    default:
      cmp = 0;
  }
  return dir === 'asc' ? cmp : -cmp;
}

function matchesSearch(o: AdminOrderRow, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  const chunks = [
    o.id,
    o.user?.email,
    o.user?.firstName,
    o.user?.lastName,
    o.store?.name,
    o.shippingAddress,
    ...(o.items?.map((i) => i.product?.name) ?? []),
  ];
  return chunks.some((c) => (c ?? '').toLowerCase().includes(n));
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function OrderDetailsPanel({ order }: { order: Order }) {
  const [detailTab, setDetailTab] = useState<'envio' | 'lineas'>('envio');
  const items = order.items ?? [];
  const lineCount = items.length;
  const clientLabel = order.user
    ? `${order.user.firstName ?? ''} ${order.user.lastName ?? ''}`.trim() ||
      order.user.email
    : order.userId;
  const createdAt = (order as { createdAt?: string }).createdAt;

  return (
    <AdminDetailPanelRoot>
      <AdminDetailPanelTop>
        <AdminDetailTitleRow
          title="Pedido"
          subtitle={order.id}
          badges={
            <>
              <span className="rounded border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-slate-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300">
                {formatPrice(numAmount(order.totalAmount))}
              </span>
              <AdminStatusBadge tone={orderStatusTone(order.status)}>
                {formatOrderStatus(order.status)}
              </AdminStatusBadge>
            </>
          }
        />

        <AdminDetailStatsGrid>
          <AdminDetailStatTile
            label="Total"
            value={formatPrice(numAmount(order.totalAmount))}
            hint="pedido"
          />
          <AdminDetailStatTile
            label="Líneas"
            value={lineCount}
            hint={lineCount === 1 ? '1 artículo' : `${lineCount} artículos`}
          />
          <AdminDetailStatTile
            label="Cliente"
            value={clientLabel.length > 18 ? `${clientLabel.slice(0, 16)}…` : clientLabel}
            hint="comprador"
          />
          <AdminDetailStatTile
            label="Fecha"
            value={formatDate(createdAt)}
            hint="alta"
          />
        </AdminDetailStatsGrid>

        <AdminDetailHeroSplit
          image={
            <AdminDetailImageFrame ariaLabel="Pedido">
              <FiShoppingCart
                className="h-12 w-12 text-slate-400 dark:text-slate-500"
                aria-hidden
              />
            </AdminDetailImageFrame>
          }
          fields={
            <AdminDetailFieldsGrid>
              <AdminDetailCompactField label="Cliente" icon={FiUser}>
                {clientLabel}
              </AdminDetailCompactField>
              <AdminDetailCompactField label="Correo" icon={FiMail}>
                {order.user?.email ?? '—'}
              </AdminDetailCompactField>
              <AdminDetailCompactField label="Tienda" icon={FiShoppingBag}>
                {order.store?.name ?? '—'}
              </AdminDetailCompactField>
              <AdminDetailCompactFieldBlock
                label="Dirección de envío"
                icon={FiMapPin}
              >
                {order.shippingAddress?.trim() || 'No especificada'}
              </AdminDetailCompactFieldBlock>
            </AdminDetailFieldsGrid>
          }
        />
      </AdminDetailPanelTop>

      <AdminDetailScrollSection
        tablistLabel="Envío y líneas"
        tabs={[
          { id: 'envio', label: 'Envío' },
          { id: 'lineas', label: 'Líneas' },
        ]}
        activeTab={detailTab}
        onTabChange={(id) => setDetailTab(id as 'envio' | 'lineas')}
      >
        {detailTab === 'envio' ? (
          <div className="space-y-3 pb-1">
            <div className="rounded-lg border border-slate-200/80 bg-white p-3 dark:border-sky-500/20 dark:bg-[#0f1a38]">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Dirección completa
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {order.shippingAddress?.trim() || 'No especificada'}
              </p>
            </div>
          </div>
        ) : lineCount > 0 ? (
          <div className="market-table-wrap market-table-wrap--clip rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-[#0f1a38] dark:text-slate-400">
                <tr>
                  <th className="px-2.5 py-2">Producto</th>
                  <th className="px-2.5 py-2 text-right">Cant.</th>
                  <th className="px-2.5 py-2 text-right">P. unit.</th>
                  <th className="px-2.5 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-slate-100 dark:border-sky-500/10"
                  >
                    <td className="px-2.5 py-1.5 text-slate-700 dark:text-slate-200">
                      {item.product?.name ?? 'Producto'}
                    </td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums text-slate-700 dark:text-slate-200">
                      {item.quantity}
                    </td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums text-slate-700 dark:text-slate-200">
                      {formatPrice(numAmount(item.unitPrice))}
                    </td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums font-medium text-slate-900 dark:text-slate-100">
                      {formatPrice(numAmount(item.unitPrice) * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="pb-4 text-sm text-slate-500 dark:text-slate-400">
            Este pedido no tiene líneas registradas.
          </p>
        )}
      </AdminDetailScrollSection>
    </AdminDetailPanelRoot>
  );
}

function OrderDetailsDrawer({
  open,
  onClose,
  isLoading,
  isError,
  order,
}: {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  isError: boolean;
  order?: Order;
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
        aria-label="Detalle de pedido"
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
            <p className="px-4 py-4 text-sm text-slate-500">
              Cargando detalle…
            </p>
          ) : isError ? (
            <p className="px-4 py-4 text-sm text-red-600">
              No se pudo cargar el detalle del pedido.
            </p>
          ) : order ? (
            <OrderDetailsPanel order={order} />
          ) : (
            <p className="px-4 py-4 text-sm text-slate-500">
              No hay datos del pedido.
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
  thClassName = '',
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey, direction: SortDir) => void;
  align?: 'left' | 'right' | 'center';
  thClassName?: string;
}) {
  const active = activeKey === sortKey;
  const alignClass =
    align === 'right'
      ? 'text-right'
      : align === 'center'
        ? 'text-center'
        : 'text-left';
  return (
    <th
      className={`px-4 py-3.5 ${alignClass} ${thClassName}`.trim()}
    >
      <div className="inline-flex items-center gap-2">
        <span className="leading-tight">{label}</span>
        <span className="inline-flex shrink-0 flex-col items-center gap-0 leading-none">
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

export function AdminOrdersPage() {
  const { user } = useAuth();
  const isSeller = user?.role === 'SELLER';
  const adminOrdersQ = useAdminOrdersQuery();
  const sellerOrdersQ = useStoreOrdersSellerQuery();
  const data = isSeller ? sellerOrdersQ.data : adminOrdersQ.data;
  const isLoading = isSeller ? sellerOrdersQ.isLoading : adminOrdersQ.isLoading;
  const isError = isSeller ? sellerOrdersQ.isError : adminOrdersQ.isError;
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const orderDetailQuery = useOrderDetailQuery(
    viewOrderId ?? undefined,
  );

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

  const orders = useMemo(() => {
    const raw = Array.isArray(data) ? data : [];
    if (isSeller) {
      return (raw as (Order & { createdAt?: string })[]).map(orderToAdminRow);
    }
    return raw as AdminOrderRow[];
  }, [data, isSeller]);

  const filteredSorted = useMemo(() => {
    const q = search.trim();
    const list = orders.filter((o) => matchesSearch(o, q));
    return [...list].sort((a, b) => compareOrders(a, b, sortKey, sortDir));
  }, [orders, search, sortKey, sortDir]);

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

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h2 className="flex shrink-0 items-center gap-2.5 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        <FiShoppingCart
          className="h-7 w-7 shrink-0 text-zinc-900 dark:text-zinc-50"
          aria-hidden
        />
        Pedidos
      </h2>

      {isLoading ? (
        <p className="text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="text-center text-sm text-red-600">
          No se pudieron cargar los pedidos.
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
                placeholder="Buscar por ID, cliente, tienda, dirección o producto…"
                className={`box-border h-11 w-full rounded-md border border-zinc-200 bg-white py-0 pl-10 text-sm leading-normal text-zinc-900 shadow-sm ring-zinc-200 placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]/25 dark:border-night-700 dark:bg-night-950 dark:text-zinc-50 dark:ring-night-800 ${search ? 'pr-11' : 'pr-4'}`}
                aria-label="Buscar pedidos"
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
                className="no-scrollbar shrink-0 overflow-x-auto overflow-y-hidden border-b border-slate-200/80 dark:border-sky-500/20"
              >
                <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-sm">
                  <OrdersTableColgroup />
                  <thead className="bg-slate-100/92 backdrop-blur-md dark:bg-[#0f1a38]/95 dark:backdrop-blur-md">
                    <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      <SortHeader
                        label="Fecha"
                        sortKey="date"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Cliente"
                        sortKey="client"
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
                        label="Total"
                        sortKey="total"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                        align="center"
                      />
                      <SortHeader
                        label="Estado"
                        sortKey="status"
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
                className="market-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto"
              >
                <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-sm">
                  <OrdersTableColgroup />
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={NUM_COLS}
                          className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                        >
                          {orders.length === 0
                            ? 'No hay pedidos registrados.'
                            : 'Ningún pedido coincide con la búsqueda.'}
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((o) => (
                        <tr
                          key={o.id}
                          className="border-b border-slate-200/55 transition-colors last:border-0 hover:bg-slate-50/90 dark:border-sky-500/[0.12] dark:hover:bg-sky-950/20"
                        >
                          <td className="px-4 py-2 align-middle">
                            <p className="leading-tight text-slate-700 dark:text-slate-300">
                              {renderTableCellString(formatDate(o.createdAt))}
                            </p>
                            <p className="mt-0.5 font-mono text-[11px] leading-tight text-slate-400 dark:text-slate-500">
                              {o.id.slice(0, 8)}…
                            </p>
                          </td>
                          <td className="px-4 py-2 align-middle">
                            {o.user ? (
                              <>
                                <p className="leading-tight text-slate-700 dark:text-slate-300">
                                  {`${o.user.firstName ?? ''} ${o.user.lastName ?? ''}`.trim() ||
                                    o.user.email}
                                </p>
                                <p className="mt-0.5 text-xs leading-tight text-slate-500 dark:text-slate-500">
                                  {o.user.email}
                                </p>
                              </>
                            ) : (
                              <TableEmptyCell className="text-slate-400 dark:text-slate-500" />
                            )}
                          </td>
                          <td className="px-4 py-2 align-middle text-slate-700 dark:text-slate-300">
                            {o.store?.name ?? <TableEmptyCell />}
                          </td>
                          <td className="px-4 py-2 align-middle text-center tabular-nums font-medium text-slate-900 dark:text-slate-100">
                            {formatPrice(numAmount(o.totalAmount))}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            <AdminStatusBadge tone={orderStatusTone(o.status)}>
                              {formatOrderStatus(o.status)}
                            </AdminStatusBadge>
                          </td>
                          <td className="px-4 py-2 align-middle text-center">
                            <div className="flex flex-nowrap items-center justify-center gap-1.5">
                              <Button
                                type="button"
                                variant="icon"
                                className="!text-[#2563eb] hover:bg-blue-500/10 dark:!text-sky-400 dark:hover:bg-sky-500/15"
                                aria-label={`Ver detalle del pedido ${o.id.slice(0, 8)}`}
                                onClick={() => {
                                  setMode('view');
                                  setViewOrderId(o.id);
                                }}
                              >
                                <FiEye className="h-4 w-4" aria-hidden />
                              </Button>
                              <Button
                                type="button"
                                variant="icon"
                                className="!text-yellow-600 hover:bg-yellow-500/15 dark:!text-sky-300 dark:hover:bg-sky-500/15"
                                aria-label={`Editar pedido ${o.id.slice(0, 8)}`}
                                onClick={() => {
                                  setMode('edit');
                                  setViewOrderId(o.id);
                                }}
                              >
                                <FiEdit2 className="h-4 w-4" aria-hidden />
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
                    ? '0 pedidos'
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
            open={viewOrderId != null && mode === 'edit'}
            onClose={() => {
              setViewOrderId(null);
              setMode('view');
            }}
            title={
              orderDetailQuery.data
                ? `Editar pedido: ${orderDetailQuery.data.id.slice(0, 8)}…`
                : 'Editar pedido'
            }
          >
            <div className="min-h-0 flex-1 overflow-hidden">
              {orderDetailQuery.isLoading ? (
                <p className="px-5 py-4 text-sm text-zinc-500">
                  Cargando detalle…
                </p>
              ) : orderDetailQuery.isError ? (
                <p className="px-5 py-4 text-sm text-red-600">
                  No se pudo cargar el detalle del pedido.
                </p>
              ) : orderDetailQuery.data ? (
                <AdminEditOrderForm
                  order={orderDetailQuery.data}
                  onSuccess={() => {
                    setViewOrderId(null);
                    setMode('view');
                  }}
                  onCancel={() => {
                    setMode('view');
                  }}
                />
              ) : null}
            </div>
          </Modal>

          <OrderDetailsDrawer
            open={viewOrderId != null && mode === 'view'}
            onClose={() => {
              setViewOrderId(null);
              setMode('view');
            }}
            isLoading={orderDetailQuery.isLoading}
            isError={orderDetailQuery.isError}
            order={orderDetailQuery.data}
          />
        </div>
      )}
    </div>
  );
}
