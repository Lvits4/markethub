import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { TablePagination } from '../../components/TablePagination/TablePagination';
import { FilterPopover } from '../../components/FilterPopover/FilterPopover';
import type { FilterField } from '../../components/FilterPopover/FilterPopover';
import { formatPrice } from '../../helpers/formatPrice';
import { useSellerVentasQuery } from '../../queries/useSellerVentasQuery';
import type { SellerVentasRow } from '../../types/admin';

type SortKey = 'store' | 'revenue' | 'commission' | 'sellerEarnings' | 'adminEarnings' | 'orders' | 'products';
type SortDir = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 10;
const NUM_DATA_COLS = 7;

const COMMISSION_RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: '0-5', label: '0 – 5%' },
  { value: '5-10', label: '5 – 10%' },
  { value: '10-20', label: '10 – 20%' },
  { value: '20+', label: 'Más de 20%' },
];

const REVENUE_RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: '0-1000', label: 'Menos de $1,000' },
  { value: '1000-10000', label: '$1,000 – $10,000' },
  { value: '10000+', label: 'Más de $10,000' },
];

const VENTAS_FILTER_DEFAULTS = { commissionRange: '', revenueRange: '' };

const VENTAS_DATA_COL_WIDTH = `${(100 - 3.5) / 7}%`;

function VentasTableColgroup() {
  return (
    <colgroup>
      <col style={{ width: '3.5%' }} />
      <col style={{ width: VENTAS_DATA_COL_WIDTH }} />
      <col style={{ width: VENTAS_DATA_COL_WIDTH }} />
      <col style={{ width: VENTAS_DATA_COL_WIDTH }} />
      <col style={{ width: VENTAS_DATA_COL_WIDTH }} />
      <col style={{ width: VENTAS_DATA_COL_WIDTH }} />
      <col style={{ width: VENTAS_DATA_COL_WIDTH }} />
      <col style={{ width: VENTAS_DATA_COL_WIDTH }} />
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
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey, direction: SortDir) => void;
  align?: 'left' | 'right';
}) {
  const active = activeKey === sortKey;
  const AscIcon = FiChevronLeft;
  const DescIcon = FiChevronRight;
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
            className={`rounded p-0 leading-none transition-colors hover:bg-slate-200 dark:hover:bg-sky-950/50 ${active && dir === 'asc' ? 'text-forest' : 'text-slate-400 dark:text-slate-500'}`}
            aria-label={`Ordenar ${label} ascendente`}
            onClick={() => onSort(sortKey, 'asc')}
          >
            <AscIcon className="h-3 w-3 rotate-90" aria-hidden />
          </button>
          <button
            type="button"
            className={`rounded p-0 leading-none transition-colors hover:bg-slate-200 dark:hover:bg-sky-950/50 ${active && dir === 'desc' ? 'text-forest' : 'text-slate-400 dark:text-slate-500'}`}
            aria-label={`Ordenar ${label} descendente`}
            onClick={() => onSort(sortKey, 'desc')}
          >
            <DescIcon className="h-3 w-3 rotate-90" aria-hidden />
          </button>
        </span>
      </div>
    </th>
  );
}

function matchesSearch(row: SellerVentasRow, q: string) {
  if (!q) return true;
  const lq = q.toLowerCase();
  return (
    row.storeName.toLowerCase().includes(lq) ||
    formatPrice(row.totalRevenue).toLowerCase().includes(lq) ||
    String(row.commission).includes(lq) ||
    formatPrice(row.sellerEarnings).toLowerCase().includes(lq) ||
    String(row.totalOrders).includes(lq) ||
    String(row.activeProducts).includes(lq)
  );
}

function matchesVentasFilter(
  row: SellerVentasRow,
  filters: { commissionRange: string; revenueRange: string },
): boolean {
  if (filters.commissionRange) {
    const c = row.commission;
    switch (filters.commissionRange) {
      case '0-5':
        if (c < 0 || c >= 5) return false;
        break;
      case '5-10':
        if (c < 5 || c >= 10) return false;
        break;
      case '10-20':
        if (c < 10 || c >= 20) return false;
        break;
      case '20+':
        if (c < 20) return false;
        break;
    }
  }
  if (filters.revenueRange) {
    const r = row.totalRevenue;
    switch (filters.revenueRange) {
      case '0-1000':
        if (r >= 1000) return false;
        break;
      case '1000-10000':
        if (r < 1000 || r >= 10000) return false;
        break;
      case '10000+':
        if (r < 10000) return false;
        break;
    }
  }
  return true;
}

function compareRows(a: SellerVentasRow, b: SellerVentasRow, key: SortKey, dir: SortDir) {
  const mul = dir === 'asc' ? 1 : -1;
  switch (key) {
    case 'store':
      return mul * a.storeName.localeCompare(b.storeName);
    case 'revenue':
      return mul * (a.totalRevenue - b.totalRevenue);
    case 'commission':
      return mul * (a.commission - b.commission);
    case 'sellerEarnings':
      return mul * (a.sellerEarnings - b.sellerEarnings);
    case 'adminEarnings':
      return mul * (a.adminEarnings - b.adminEarnings);
    case 'orders':
      return mul * (a.totalOrders - b.totalOrders);
    case 'products':
      return mul * (a.activeProducts - b.activeProducts);
    default:
      return 0;
  }
}

export function SellerVentasPage() {
  const { data, isLoading, isError } = useSellerVentasQuery();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('sellerEarnings');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [ventasFilters, setVentasFilters] = useState(VENTAS_FILTER_DEFAULTS);

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

  const rows = Array.isArray(data) ? data : [];

  const ventasFilterFields: FilterField[] = useMemo(
    () => [
      { key: 'commissionRange', label: 'Comisión', options: COMMISSION_RANGE_OPTIONS },
      { key: 'revenueRange', label: 'Ventas totales', options: REVENUE_RANGE_OPTIONS },
    ],
    [],
  );

  const filteredSorted = useMemo(() => {
    const q = search.trim();
    const list = rows
      .filter((r) => matchesSearch(r, q))
      .filter((r) => matchesVentasFilter(r, ventasFilters));
    return [...list].sort((a, b) => compareRows(a, b, sortKey, sortDir));
  }, [rows, search, sortKey, sortDir, ventasFilters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSorted.length / pageSize) || 1,
  );

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize, ventasFilters]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, page, pageSize]);

  const handleSort = useCallback((key: SortKey, direction: SortDir) => {
    setSortKey(key);
    setSortDir(direction);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-500">Cargando ventas…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-sm text-red-600">
        No se pudieron cargar las ventas.
      </p>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
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
            placeholder="Buscar por tienda, comisión, ganancia…"
            className={`box-border h-11 w-full rounded-md border border-zinc-200 bg-white py-0 pl-10 text-sm leading-normal text-zinc-900 shadow-sm ring-zinc-200 placeholder:text-zinc-400 focus:border-forest focus:outline-hidden focus:ring-2 focus:ring-forest/25 dark:border-night-700 dark:bg-night-950 dark:text-zinc-50 dark:ring-night-800 ${search ? 'pr-11' : 'pr-4'}`}
            aria-label="Buscar ventas"
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
        <FilterPopover
          fields={ventasFilterFields}
          values={ventasFilters}
          defaultValues={VENTAS_FILTER_DEFAULTS}
          onApply={(v) => setVentasFilters(v as typeof VENTAS_FILTER_DEFAULTS)}
          onClear={() => setVentasFilters(VENTAS_FILTER_DEFAULTS)}
        />
        </div>

        <div className="admin-table-panel">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div
              ref={tableHeaderScrollRef}
              onScroll={onTableHeaderScroll}
              className="no-scrollbar shrink-0 overflow-x-auto overflow-y-hidden border-b border-slate-200/80 dark:border-sky-500/20"
            >
              <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-sm">
                <VentasTableColgroup />
                <thead className="bg-slate-100/92 backdrop-blur-md dark:bg-admin-elevated/95 dark:backdrop-blur-md">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    <th className="w-10 px-2 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      #
                    </th>
                    <SortHeader
                      label="Tienda"
                      sortKey="store"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <SortHeader
                      label="Ventas totales"
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
                      label="Mi ganancia"
                      sortKey="sellerEarnings"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                      align="right"
                    />
                    <SortHeader
                      label="Comisión admin"
                      sortKey="adminEarnings"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                      align="right"
                    />
                    <SortHeader
                      label="Pedidos"
                      sortKey="orders"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                      align="right"
                    />
                    <SortHeader
                      label="Productos"
                      sortKey="products"
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
              <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-sm">
                <VentasTableColgroup />
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={NUM_DATA_COLS + 1}
                        className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                      >
                        {rows.length === 0
                          ? 'Sin datos de ventas. ¿Tienes tiendas aprobadas?'
                          : 'Ninguna tienda coincide con la búsqueda.'}
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((row, idx) => (
                      <tr
                        key={row.storeId}
                        className="border-b border-slate-200/55 transition-colors last:border-0 hover:bg-slate-50/90 dark:border-sky-500/[0.12] dark:hover:bg-sky-950/20"
                      >
                        <td className="w-10 px-2 py-2 text-center align-middle tabular-nums text-slate-400 dark:text-slate-500">
                          {(page - 1) * pageSize + idx + 1}
                        </td>
                        <td className="px-4 py-2 align-middle">
                          <p className="font-medium leading-tight text-slate-900 dark:text-slate-100">
                            {row.storeName}
                          </p>
                        </td>
                        <td className="px-4 py-2 text-right align-middle tabular-nums text-slate-700 dark:text-slate-300">
                          {formatPrice(row.totalRevenue)}
                        </td>
                        <td className="px-4 py-2 text-right align-middle tabular-nums text-slate-700 dark:text-slate-300">
                          {row.commission}%
                        </td>
                        <td className="px-4 py-2 text-right align-middle tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                          {formatPrice(row.sellerEarnings)}
                        </td>
                        <td className="px-4 py-2 text-right align-middle tabular-nums text-slate-700 dark:text-slate-300">
                          {formatPrice(row.adminEarnings)}
                        </td>
                        <td className="px-4 py-2 text-right align-middle tabular-nums text-slate-700 dark:text-slate-300">
                          {row.totalOrders}
                        </td>
                        <td className="px-4 py-2 text-right align-middle tabular-nums text-slate-700 dark:text-slate-300">
                          {row.activeProducts}
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
    </div>
  );
}
