import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FiChevronUp,
  FiChevronDown,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { TablePagination } from '../../components/TablePagination/TablePagination';
import { formatPrice } from '../../helpers/formatPrice';
import { useSellerReportQuery } from '../../queries/useSellerReportQuery';
import { useSellerDashboardQuery } from '../../queries/useSellerDashboardQuery';

type ProductSortKey = 'name' | 'quantity' | 'revenue' | 'commission' | 'net';
type SortDir = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 10;
const NUM_DATA_COLS = 5;

function ReportTableColgroup() {
  return (
    <colgroup>
      <col style={{ width: '3.5%' }} />
      <col style={{ width: '24.3%' }} />
      <col style={{ width: '14.5%' }} />
      <col style={{ width: '19.3%' }} />
      <col style={{ width: '19.2%' }} />
      <col style={{ width: '19.2%' }} />
    </colgroup>
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
  sortKey: ProductSortKey;
  activeKey: ProductSortKey;
  dir: SortDir;
  onSort: (key: ProductSortKey, direction: SortDir) => void;
  align?: 'left' | 'right';
}) {
  const active = activeKey === sortKey;
  return (
    <th className={`px-4 py-3.5 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <div className={`inline-flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <span className="leading-tight">{label}</span>
        <span className="inline-flex shrink-0 flex-col items-center gap-0 leading-none">
          <button
            type="button"
            className={`rounded p-0 leading-none transition-colors hover:bg-slate-200 dark:hover:bg-sky-950/50 ${active && dir === 'asc' ? 'text-forest' : 'text-slate-400 dark:text-slate-500'}`}
            aria-label={`Ordenar ${label} ascendente`}
            onClick={() => onSort(sortKey, 'asc')}
          >
            <FiChevronUp className="h-3 w-3" aria-hidden />
          </button>
          <button
            type="button"
            className={`rounded p-0 leading-none transition-colors hover:bg-slate-200 dark:hover:bg-sky-950/50 ${active && dir === 'desc' ? 'text-forest' : 'text-slate-400 dark:text-slate-500'}`}
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

type ProductRow = {
  name: string;
  quantity: number;
  revenue: number;
  commissionAmt: number;
  netEarnings: number;
};

function matchesSearch(row: ProductRow, q: string) {
  if (!q) return true;
  const lq = q.toLowerCase();
  return (
    row.name.toLowerCase().includes(lq) ||
    String(row.quantity).includes(lq) ||
    formatPrice(row.revenue).toLowerCase().includes(lq)
  );
}

function compareRows(a: ProductRow, b: ProductRow, key: ProductSortKey, dir: SortDir) {
  const mul = dir === 'asc' ? 1 : -1;
  switch (key) {
    case 'name':
      return mul * a.name.localeCompare(b.name);
    case 'quantity':
      return mul * (a.quantity - b.quantity);
    case 'revenue':
      return mul * (a.revenue - b.revenue);
    case 'commission':
      return mul * (a.commissionAmt - b.commissionAmt);
    case 'net':
      return mul * (a.netEarnings - b.netEarnings);
    default:
      return 0;
  }
}

function StatBlock({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-sm dark:shadow-none">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function SellerReportPage() {
  const { data, isLoading, isError } = useSellerReportQuery();
  const sellerDash = useSellerDashboardQuery();

  const commissionOwed = sellerDash.data?.commissionOwed ?? 0;
  const sellerEarnings = sellerDash.data?.sellerEarnings ?? 0;
  const commissionPct = sellerDash.data?.topStoresByEarnings?.[0]?.commission ?? 5;

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<ProductSortKey>('revenue');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

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

  const productRows: ProductRow[] = useMemo(() => {
    if (!data?.productSales) return [];
    return data.productSales.map((row) => {
      const commissionAmt = row.revenue * (commissionPct / 100);
      const netEarnings = row.revenue - commissionAmt;
      return { ...row, commissionAmt, netEarnings };
    });
  }, [data, commissionPct]);

  const filteredSorted = useMemo(() => {
    const q = search.trim();
    const list = productRows.filter((r) => matchesSearch(r, q));
    return [...list].sort((a, b) => compareRows(a, b, sortKey, sortDir));
  }, [productRows, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize) || 1);

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

  const handleSort = useCallback((key: ProductSortKey, direction: SortDir) => {
    setSortKey(key);
    setSortDir(direction);
  }, []);

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
        No se pudo cargar el informe. ¿Tienes al menos una tienda registrada?
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-center text-sm text-zinc-500">Sin datos.</p>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatBlock label="Ventas totales" value={formatPrice(data.totalSales)} />
        <StatBlock
          label="Ganancia neta"
          value={formatPrice(sellerEarnings)}
          hint={`Comisión total: ${formatPrice(commissionOwed)}`}
        />
        <StatBlock
          label="Pedidos"
          value={String(data.totalOrders)}
          hint={`${data.completedOrders} completados · ${data.pendingOrders} pendientes (aprox.)`}
        />
      </div>

      {productRows.length > 0 ? (
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
                placeholder="Buscar por producto, unidades, ingresos…"
                className={`box-border h-11 w-full rounded-md border border-zinc-200 bg-white py-0 pl-10 text-sm leading-normal text-zinc-900 shadow-sm ring-zinc-200 placeholder:text-zinc-400 focus:border-forest focus:outline-hidden focus:ring-2 focus:ring-forest/25 dark:border-night-700 dark:bg-night-950 dark:text-zinc-50 dark:ring-night-800 ${search ? 'pr-11' : 'pr-4'}`}
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
          </div>

          <div className="admin-table-panel">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div
                ref={tableHeaderScrollRef}
                onScroll={onTableHeaderScroll}
                className="no-scrollbar shrink-0 overflow-x-auto overflow-y-hidden border-b border-slate-200/80 dark:border-sky-500/20"
              >
                <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-sm">
                  <ReportTableColgroup />
                  <thead className="bg-slate-100/92 backdrop-blur-md dark:bg-admin-elevated/95 dark:backdrop-blur-md">
                    <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      <th className="w-8 px-2 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        #
                      </th>
                      <SortHeader
                        label="Producto"
                        sortKey="name"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Unidades"
                        sortKey="quantity"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                        align="right"
                      />
                      <SortHeader
                        label="Ingresos"
                        sortKey="revenue"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                        align="right"
                      />
                      <SortHeader
                        label="Comisión"
                        sortKey="commission"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                        align="right"
                      />
                      <SortHeader
                        label="Ganancia neta"
                        sortKey="net"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                        align="right"
                      />
                    </tr>
                  </thead>
                </table>
              </div>
              <div
                ref={tableBodyScrollRef}
                onScroll={onTableBodyScroll}
                className="market-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto"
              >
                <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-sm">
                  <ReportTableColgroup />
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={NUM_DATA_COLS + 1}
                          className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                        >
                          {productRows.length === 0
                            ? 'Sin datos de ventas. ¿Tienes tiendas aprobadas?'
                            : 'Ningún producto coincide con la búsqueda.'}
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((row, idx) => (
                        <tr
                          key={`${row.name}-${idx}`}
                          className="border-b border-slate-200/55 transition-colors last:border-0 hover:bg-slate-50/90 dark:border-sky-500/[0.12] dark:hover:bg-sky-950/20"
                        >
                          <td className="w-8 px-2 py-2 text-center tabular-nums text-slate-400 dark:text-slate-500">
                            {(page - 1) * pageSize + idx + 1}
                          </td>
                          <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">
                            {row.name}
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                            {row.quantity}
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                            {formatPrice(row.revenue)}
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums text-amber-600 dark:text-amber-400">
                            {formatPrice(row.commissionAmt)}
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                            {formatPrice(row.netEarnings)}
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
        </div>
      ) : null}
    </div>
  );
}
