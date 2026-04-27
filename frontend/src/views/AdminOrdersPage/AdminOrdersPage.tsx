import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import {
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiEye,
  FiMail,
  FiMapPin,
  FiSearch,
  FiShoppingBag,
  FiShoppingCart,
  FiTrash2,
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
import { AdminDrawerWrapper } from '../../components/AdminDrawerWrapper/AdminDrawerWrapper';
import {
  AdminStatusBadge,
  orderStatusTone,
} from '../../components/AdminStatusBadge/AdminStatusBadge';
import { Button } from '../../components/Button/Button';
import { TablePagination } from '../../components/TablePagination/TablePagination';
import { TableEmptyCell } from '../../components/TableEmptyCell/TableEmptyCell';
import { Modal } from '../../components/Modal/Modal';
import { AdminEditOrderForm } from '../../components/AdminEditOrderForm/AdminEditOrderForm';
import { formatOrderStatus } from '../../helpers/orderStatus';
import { formatPrice } from '../../helpers/formatPrice';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAuth } from '../../hooks/useAuth';
import { useDeleteOrderMutation } from '../../hooks/useDeleteOrderMutation';
import { useAdminOrdersQuery } from '../../queries/useAdminOrdersQuery';
import { useOrderDetailQuery } from '../../queries/useOrderDetailQuery';
import { useStoreOrdersSellerQuery } from '../../queries/useStoreOrdersSellerQuery';
import type { AdminOrderRow } from '../../types/admin';
import type { Order } from '../../types/order';

function numAmount(v: string | number) {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

type SortKey = 'client' | 'store' | 'total' | 'status';
type SortDir = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 10;
const NUM_COLS = 6;
const ROW_NUM_WIDTH = '3.5%';
const DATA_COL_WIDTH = `${(100 - 3.5) / 5}%`;
const ORDER_TABLE_COL_WIDTHS = [ROW_NUM_WIDTH, DATA_COL_WIDTH, DATA_COL_WIDTH, DATA_COL_WIDTH, DATA_COL_WIDTH, DATA_COL_WIDTH] as const;

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

function OrderDetailsPanel({ order }: { order: Order }) {
  const [detailTab, setDetailTab] = useState<'envio' | 'lineas'>('envio');
  const items = order.items ?? [];
  const lineCount = items.length;
  const clientLabel = order.user
    ? `${order.user.firstName ?? ''} ${order.user.lastName ?? ''}`.trim() ||
      order.user.email
    : order.userId;

  return (
    <AdminDetailPanelRoot>
      <AdminDetailPanelTop>
        <AdminDetailTitleRow
          title="Pedido"
          badges={
            <>
              <span className="rounded border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-slate-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
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
            <div className="rounded-lg border border-slate-200/80 bg-white p-3 dark:border-blue-500/15 dark:bg-admin-elevated">
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
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-admin-elevated dark:text-slate-400">
                <tr>
                  <th className="w-7 px-1.5 py-2 text-center text-slate-400 dark:text-slate-500">#</th>
                  <th className="px-2.5 py-2">Producto</th>
                  <th className="px-2.5 py-2 text-right">Cant.</th>
                  <th className="px-2.5 py-2 text-right">P. unit.</th>
                  <th className="px-2.5 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={item.id}
                    className="border-t border-slate-100 dark:border-blue-500/8"
                  >
                    <td className="w-7 px-1.5 py-1.5 text-center tabular-nums text-slate-400 dark:text-slate-500">
                      {i + 1}
                    </td>
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
  onDeleteOrder,
  deletePending,
}: {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  isError: boolean;
  order?: Order;
  onDeleteOrder?: (orderId: string) => void;
  deletePending?: boolean;
}) {
  return (
    <AdminDrawerWrapper open={open} onClose={onClose} ariaLabel="Detalle de pedido">
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
      {order && onDeleteOrder ? (
        <div className="shrink-0 border-t border-slate-200/80 bg-white px-4 py-3 dark:border-blue-500/15 dark:bg-admin-drawer-head">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30 sm:w-auto"
            disabled={deletePending}
            onClick={() => onDeleteOrder(order.id)}
          >
            <FiTrash2 className="mr-2 h-4 w-4" aria-hidden />
            {deletePending ? 'Eliminando…' : 'Eliminar pedido'}
          </Button>
        </div>
      ) : null}
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

export function AdminOrdersPage() {
  const { user } = useAuth();
  const isSeller = user?.role === 'SELLER';
  const adminOrdersQ = useAdminOrdersQuery();
  const sellerOrdersQ = useStoreOrdersSellerQuery();
  const data = isSeller ? sellerOrdersQ.data : adminOrdersQ.data;
  const isLoading = isSeller ? sellerOrdersQ.isLoading : adminOrdersQ.isLoading;
  const isError = isSeller ? sellerOrdersQ.isError : adminOrdersQ.isError;
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const orderDetailQuery = useOrderDetailQuery(
    viewOrderId ?? undefined,
  );
  const deleteOrderMut = useDeleteOrderMutation();

  const openDeleteOrderModal = (orderId: string) => {
    setOrderToDelete(orderId);
  };

  const closeDeleteOrderModal = () => {
    if (!deleteOrderMut.isPending) setOrderToDelete(null);
  };

  const handleConfirmDeleteOrder = () => {
    if (!orderToDelete) return;
    const id = orderToDelete;
    deleteOrderMut.mutate(id, {
      onSuccess: () => {
        toast.success('Pedido eliminado');
        setOrderToDelete(null);
        if (viewOrderId === id) {
          setViewOrderId(null);
          setMode('view');
        }
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

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

  const orderPendingDeleteLabel = useMemo(() => {
    if (!orderToDelete) return '';
    const row = orders.find((o) => o.id === orderToDelete);
    if (row?.user) {
      const name = `${row.user.firstName ?? ''} ${row.user.lastName ?? ''}`.trim();
      return name || row.user.email || orderToDelete.slice(0, 8);
    }
    const detail = orderDetailQuery.data;
    if (detail?.id === orderToDelete && detail.user) {
      const u = detail.user;
      const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
      return name || u.email || orderToDelete.slice(0, 8);
    }
    return orderToDelete.slice(0, 8);
  }, [orderToDelete, orders, orderDetailQuery.data]);

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
                placeholder="Buscar por cliente, tienda, dirección o producto…"
                className={`box-border h-11 w-full rounded-md border border-zinc-200 bg-white py-0 pl-10 text-sm leading-normal text-zinc-900 shadow-sm ring-zinc-200 placeholder:text-zinc-400 focus:border-forest focus:outline-hidden focus:ring-2 focus:ring-forest/25 dark:border-night-700 dark:bg-night-950 dark:text-zinc-50 dark:ring-night-800 ${search ? 'pr-11' : 'pr-4'}`}
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
                className="no-scrollbar shrink-0 overflow-x-auto overflow-y-hidden border-b border-slate-200/80 dark:border-blue-500/15"
              >
                <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-sm">
                  <OrdersTableColgroup />
                  <thead className="bg-slate-100/92 backdrop-blur-md dark:bg-admin-elevated/95 dark:backdrop-blur-md">
            <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              <th className="w-10 px-2 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                #
              </th>
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
              pageRows.map((o, idx) => (
            <tr
              key={o.id}
              className="border-b border-slate-200/55 transition-colors last:border-0 hover:bg-slate-50/90 dark:border-blue-500/10 dark:hover:bg-white/[0.06]"
            >
              <td className="w-10 px-2 py-2 text-center align-middle tabular-nums text-slate-400 dark:text-slate-500">
                {(page - 1) * pageSize + idx + 1}
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
                                className="!text-blue-600 hover:bg-blue-500/10 dark:!text-blue-400 dark:hover:bg-blue-500/12"
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
                                className="!text-yellow-600 hover:bg-yellow-500/15 dark:!text-sky-300 dark:hover:bg-blue-500/12"
                                aria-label={`Editar pedido ${o.id.slice(0, 8)}`}
                                onClick={() => {
                                  setMode('edit');
                                  setViewOrderId(o.id);
                                }}
                              >
                                <FiEdit2 className="h-4 w-4" aria-hidden />
                              </Button>
                              <Button
                                type="button"
                                variant="icon"
                                className="!text-red-600 hover:bg-red-500/10 dark:!text-red-400 dark:hover:bg-red-500/15"
                                aria-label={`Eliminar pedido ${o.id.slice(0, 8)}`}
                                disabled={deleteOrderMut.isPending}
                                onClick={() => openDeleteOrderModal(o.id)}
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

          <TablePagination
            totalItems={filteredSorted.length}
            page={page}
            pageSize={pageSize}
      totalPages={totalPages}
        onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
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
            onDeleteOrder={openDeleteOrderModal}
            deletePending={deleteOrderMut.isPending}
          />

          <Modal
            open={orderToDelete != null}
            onClose={closeDeleteOrderModal}
            title="Confirmar eliminación"
          >
            <div className="space-y-4 px-5 py-4">
              <p className="text-sm text-zinc-700 dark:text-zinc-200">
                ¿Seguro que quieres eliminar el pedido de{' '}
                <span className="font-semibold">{orderPendingDeleteLabel}</span>?
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Esta acción es permanente y no se puede deshacer.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50/90 px-5 py-4 dark:border-night-800 dark:bg-night-950/90">
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-40 justify-center border border-zinc-300 bg-white px-4 text-sm text-zinc-800 hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700"
                onClick={closeDeleteOrderModal}
                disabled={deleteOrderMut.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                className="h-10 w-40 justify-center border-0 bg-rose-700/90 px-4 text-sm text-white hover:bg-rose-800 dark:bg-rose-700/90 dark:text-white dark:hover:bg-rose-800"
                onClick={handleConfirmDeleteOrder}
                disabled={deleteOrderMut.isPending}
              >
                {deleteOrderMut.isPending ? 'Eliminando…' : 'Eliminar pedido'}
              </Button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
