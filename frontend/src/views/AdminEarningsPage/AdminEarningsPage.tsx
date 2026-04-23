import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  FiChevronDown,
  FiChevronUp,
  FiDollarSign,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { TablePagination } from '../../components/TablePagination/TablePagination';
import { formatPrice } from '../../helpers/formatPrice';
import { getErrorMessage } from '../../helpers/mapApiError';
import { queryKeys } from '../../helpers/queryKeys';
import { useAdminEarningsReportQuery } from '../../queries/useAdminEarningsReportQuery';
import { patchAdminStoreCommission } from '../../requests/adminRequests';
import type { AdminEarningsRow } from '../../types/admin';

type SortKey = 'store' | 'commission' | 'revenue' | 'sellerEarnings' | 'adminEarnings';
type SortDir = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 10;
const NUM_DATA_COLS = 5;
const ROW_NUM_WIDTH = '3.5%';
const COL_WIDTH = `${(100 - 3.5) / NUM_DATA_COLS}%`;

function EarningsTableColgroup() {
return (
<colgroup>
<col style={{ width: ROW_NUM_WIDTH }} />
{Array.from({ length: NUM_DATA_COLS }, (__, i) => (
<col key={i} style={{ width: COL_WIDTH }} />
))}
</colgroup>
);
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey, direction: SortDir) => void;
}) {
  const active = activeKey === sortKey;
  return (
    <th className="px-4 py-3.5 text-left">
      <div className="inline-flex items-center gap-2">
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

function matchesSearch(row: AdminEarningsRow, q: string) {
  if (!q) return true;
  const lq = q.toLowerCase();
  return (
    row.storeName.toLowerCase().includes(lq) ||
    String(row.commission).includes(lq) ||
    formatPrice(row.totalRevenue).toLowerCase().includes(lq) ||
    formatPrice(row.adminEarnings).toLowerCase().includes(lq)
  );
}

function compareRows(a: AdminEarningsRow, b: AdminEarningsRow, key: SortKey, dir: SortDir) {
  const mul = dir === 'asc' ? 1 : -1;
  switch (key) {
    case 'store':
      return mul * a.storeName.localeCompare(b.storeName);
    case 'commission':
      return mul * (a.commission - b.commission);
    case 'revenue':
      return mul * (a.totalRevenue - b.totalRevenue);
    case 'sellerEarnings':
      return mul * (a.sellerEarnings - b.sellerEarnings);
    case 'adminEarnings':
      return mul * (a.adminEarnings - b.adminEarnings);
    default:
      return 0;
  }
}

function CommissionCell({
  storeId,
  commission,
}: {
  storeId: string;
  commission: number;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(commission));
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setDraft(String(commission));
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setDraft(String(commission));
  };

  const save = async () => {
    const val = Number.parseFloat(draft);
    if (!Number.isFinite(val) || val < 0 || val > 100) {
      toast.error('Comisión debe ser 0–100');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token') ?? '';
      await patchAdminStoreCommission(token, storeId, val);
      toast.success('Comisión actualizada');
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.adminEarningsReport });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard() });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          max={100}
          step={0.5}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-16 rounded border border-slate-300 bg-white px-2 py-1 text-sm tabular-nums outline-hidden focus:border-forest focus:ring-2 focus:ring-forest/25 dark:border-sky-500/30 dark:bg-admin-field dark:text-slate-100"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') cancel();
          }}
          disabled={saving}
        />
        <span className="text-xs text-slate-500 dark:text-slate-400">%</span>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded px-1.5 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-500/10 dark:text-sky-400 dark:hover:bg-sky-500/15"
        >
          ✓
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={saving}
          className="rounded px-1.5 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-sky-950/50"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className="group inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-sm tabular-nums transition hover:bg-slate-200 dark:hover:bg-sky-950/50"
      title="Clic para editar comisión"
    >
      {commission}%
      <span className="text-[10px] text-slate-400 opacity-0 transition group-hover:opacity-100">
        ✎
      </span>
    </button>
  );
}

export function AdminEarningsPage() {
  const { data, isLoading, isError } = useAdminEarningsReportQuery();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('adminEarnings');
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

  const rows = Array.isArray(data) ? data : [];

  const filteredSorted = useMemo(() => {
    const q = search.trim();
    const list = rows.filter((r) => matchesSearch(r, q));
    return [...list].sort((a, b) => compareRows(a, b, sortKey, sortDir));
  }, [rows, search, sortKey, sortDir]);

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

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-500">Cargando ganancias…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-sm text-red-600">
        No se pudieron cargar las ganancias.
      </p>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h2 className="flex shrink-0 items-center gap-2.5 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        <FiDollarSign
          className="h-7 w-7 shrink-0 text-zinc-900 dark:text-zinc-50"
          aria-hidden
        />
        Ganancias
      </h2>

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
              aria-label="Buscar ganancias"
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
              <table className="w-full min-w-[840px] table-fixed border-collapse text-left text-sm">
                <EarningsTableColgroup />
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
              label="Comisión %"
              sortKey="commission"
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
            />
            <SortHeader
              label="Ganancia vendedor"
              sortKey="sellerEarnings"
              activeKey={sortKey}
              dir={sortDir}
              onSort={handleSort}
            />
            <SortHeader
              label="Ganancia admin"
              sortKey="adminEarnings"
              activeKey={sortKey}
              dir={sortDir}
              onSort={handleSort}
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
              <table className="w-full min-w-[840px] table-fixed border-collapse text-left text-sm">
                <EarningsTableColgroup />
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={NUM_DATA_COLS + 1}
                        className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                      >
                        {rows.length === 0
                          ? 'No hay datos de ganancias.'
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
        <td className="px-4 py-2 align-middle">
          <div className="inline-block">
            <CommissionCell
              storeId={row.storeId}
              commission={row.commission}
            />
          </div>
        </td>
        <td className="px-4 py-2 align-middle tabular-nums text-slate-700 dark:text-slate-300">
          {formatPrice(row.totalRevenue)}
        </td>
        <td className="px-4 py-2 align-middle tabular-nums text-slate-700 dark:text-slate-300">
          {formatPrice(row.sellerEarnings)}
        </td>
        <td className="px-4 py-2 align-middle tabular-nums font-medium text-green-600 dark:text-green-400">
          {formatPrice(row.adminEarnings)}
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
