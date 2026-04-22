import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiDollarSign } from 'react-icons/fi';
import { formatPrice } from '../../helpers/formatPrice';
import { getErrorMessage } from '../../helpers/mapApiError';
import { queryKeys } from '../../helpers/queryKeys';
import { useAdminEarningsReportQuery } from '../../queries/useAdminEarningsReportQuery';
import { patchAdminStoreCommission } from '../../requests/adminRequests';
import type { AdminEarningsRow } from '../../types/admin';

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
          className="w-16 rounded border border-zinc-200 px-2 py-1 text-sm tabular-nums dark:border-night-700 dark:bg-night-950"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') cancel();
          }}
          disabled={saving}
        />
        <span className="text-xs text-zinc-500">%</span>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded px-1.5 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
        >
          ✓
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={saving}
          className="rounded px-1.5 py-0.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-night-800"
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
      className="group inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-sm tabular-nums transition hover:bg-zinc-100 dark:hover:bg-night-800"
      title="Clic para editar comisión"
    >
      {commission}%
      <span className="text-[10px] text-zinc-400 opacity-0 transition group-hover:opacity-100">
        ✎
      </span>
    </button>
  );
}

export function AdminEarningsPage() {
  const { data, isLoading, isError } = useAdminEarningsReportQuery();

  const totals = (() => {
    if (!data) return null;
    let totalRevenue = 0;
    let totalSeller = 0;
    let totalAdmin = 0;
    let totalOrders = 0;
    for (const row of data) {
      totalRevenue += row.totalRevenue;
      totalSeller += row.sellerEarnings;
      totalAdmin += row.adminEarnings;
      totalOrders += row.totalOrders;
    }
    return { totalRevenue, totalSeller, totalAdmin, totalOrders };
  })();

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
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <header className="flex shrink-0 items-end justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
            Ganancias
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
            Desglose de comisiones por tienda
          </p>
        </div>
        <FiDollarSign className="h-5 w-5 shrink-0 text-zinc-400" />
      </header>

      {totals && (
        <div className="grid shrink-0 grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          <div className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 shadow-sm dark:shadow-none">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Ventas totales
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatPrice(totals.totalRevenue)}
            </p>
          </div>
          <div className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 shadow-sm dark:shadow-none">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Ganancia admin
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-green-600 dark:text-green-400">
              {formatPrice(totals.totalAdmin)}
            </p>
          </div>
          <div className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 shadow-sm dark:shadow-none">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Ganancia vendedores
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatPrice(totals.totalSeller)}
            </p>
          </div>
          <div className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 shadow-sm dark:shadow-none">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Pedidos
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {totals.totalOrders}
            </p>
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-border)] text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                <th className="px-4 py-3">Tienda</th>
                <th className="px-4 py-3">Comisión %</th>
                <th className="px-4 py-3 text-right">Ventas totales</th>
                <th className="px-4 py-3 text-right">Ganancia vendedor</th>
                <th className="px-4 py-3 text-right">Ganancia admin</th>
                <th className="px-4 py-3 text-right">Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {!data?.length ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-zinc-500"
                  >
                    Sin datos de ganancias
                  </td>
                </tr>
              ) : (
                data.map((row: AdminEarningsRow) => (
                  <tr
                    key={row.storeId}
                    className="border-b border-[var(--admin-border)] last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                      {row.storeName}
                    </td>
                    <td className="px-4 py-3">
                      <CommissionCell
                        storeId={row.storeId}
                        commission={row.commission}
                      />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatPrice(row.totalRevenue)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatPrice(row.sellerEarnings)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-green-600 dark:text-green-400">
                      {formatPrice(row.adminEarnings)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {row.totalOrders}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
