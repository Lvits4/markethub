import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/Button/Button';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAdminPatchCommission } from '../../hooks/useAdminPatchCommission';
import { useAdminStoresQuery } from '../../queries/useAdminStoresQuery';

function numOrZero(v: string | number) {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export function AdminStoresPage() {
  const { data, isLoading, isError } = useAdminStoresQuery();
  const patchCommission = useAdminPatchCommission();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data?.length) return;
    setDrafts((prev) => {
      const next = { ...prev };
      for (const s of data) {
        if (next[s.id] === undefined) {
          next[s.id] = String(numOrZero(s.commission));
        }
      }
      return next;
    });
  }, [data]);

  const saveCommission = (storeId: string) => {
    const raw = drafts[storeId]?.trim() ?? '';
    const n = Number.parseFloat(raw.replace(',', '.'));
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      toast.error('Comisión debe ser un número entre 0 y 100');
      return;
    }
    patchCommission.mutate(
      { storeId, commission: n },
      {
        onSuccess: () => toast.success('Comisión actualizada'),
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Tiendas
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Listado global desde{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
          GET /admin/stores
        </code>
        . Ajusta la comisión por tienda (
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
          PATCH /admin/stores/:id/commission
        </code>
        ).
      </p>

      {isLoading ? (
        <p className="mt-10 text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="mt-10 text-center text-sm text-red-600">
          No se pudieron cargar las tiendas.
        </p>
      ) : !data?.length ? (
        <p className="mt-10 text-center text-sm text-zinc-500">
          No hay tiendas registradas.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-3xl bg-white shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-zinc-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                <th className="px-5 py-4">Tienda</th>
                <th className="px-5 py-4">Vendedor</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Comisión %</th>
                <th className="px-5 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-zinc-50 last:border-0 dark:border-zinc-800/80"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {s.name}
                    </p>
                    <p className="text-xs text-zinc-500">{s.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                    {s.user ? (
                      <>
                        <p>
                          {s.user.firstName} {s.user.lastName}
                        </p>
                        <p className="text-xs text-zinc-500">{s.user.email}</p>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs">
                      {s.isApproved ? (
                        <span className="text-[var(--color-forest)] dark:text-emerald-400">
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
                  <td className="px-5 py-4">
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-24 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                      value={drafts[s.id] ?? ''}
                      onChange={(e) =>
                        setDrafts((d) => ({ ...d, [s.id]: e.target.value }))
                      }
                      aria-label={`Comisión ${s.name}`}
                    />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-xs"
                      disabled={patchCommission.isPending}
                      onClick={() => saveCommission(s.id)}
                    >
                      Guardar comisión
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
