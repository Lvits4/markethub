import toast from 'react-hot-toast';
import { Button } from '../../components/Button/Button';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useStoreApprove, useStoreReject } from '../../hooks/useStoreModeration';
import { useRejectedStoresQuery } from '../../queries/useRejectedStoresQuery';

export function AdminModerationPage() {
  const { data, isLoading, isError } = useRejectedStoresQuery();
  const approve = useStoreApprove();
  const reject = useStoreReject();

  const busy = approve.isPending || reject.isPending;

  const onApprove = (id: string) => {
    approve.mutate(id, {
      onSuccess: () => toast.success('Tienda aprobada'),
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  const onReject = (id: string) => {
    reject.mutate(id, {
      onSuccess: () => toast.success('Tienda marcada como no aprobada'),
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Moderación de tiendas
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Tiendas con{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
          isApproved = false
        </code>{' '}
        (
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
          GET /stores/rejected
        </code>
        ). Aprueba o rechaza con{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
          PATCH /stores/:id/approve
        </code>{' '}
        o{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
          /reject
        </code>
        .
      </p>

      {isLoading ? (
        <p className="mt-10 text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="mt-10 text-center text-sm text-red-600">
          No se pudo cargar la cola de moderación.
        </p>
      ) : !data?.length ? (
        <p className="mt-10 text-center text-sm text-zinc-500">
          No hay tiendas pendientes de aprobación.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-3xl bg-white shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-zinc-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                <th className="px-5 py-4">Tienda</th>
                <th className="px-5 py-4">Vendedor</th>
                <th className="px-5 py-4 text-right">Acciones</th>
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
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        className="text-xs"
                        disabled={busy}
                        onClick={() => onApprove(s.id)}
                      >
                        Aprobar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="text-xs"
                        disabled={busy}
                        onClick={() => onReject(s.id)}
                      >
                        Rechazar
                      </Button>
                    </div>
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
