import toast from 'react-hot-toast';
import { Button } from '../../components/Button/Button';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAdminToggleUserActive } from '../../hooks/useAdminToggleUserActive';
import { useAdminUsersQuery } from '../../queries/useAdminUsersQuery';

export function AdminUsersPage() {
  const { data, isLoading, isError } = useAdminUsersQuery();
  const toggle = useAdminToggleUserActive();

  const handleToggle = (id: string) => {
    toggle.mutate(id, {
      onSuccess: () => toast.success('Estado del usuario actualizado'),
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Usuarios
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Activa o desactiva cuentas. Los administradores no deberían desactivarse
        a sí mismos sin otro admin.
      </p>

      {isLoading ? (
        <p className="mt-10 text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="mt-10 text-center text-sm text-red-600">
          No se pudieron cargar los usuarios.
        </p>
      ) : !data?.length ? (
        <p className="mt-10 text-center text-sm text-zinc-500">
          No hay usuarios.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-3xl bg-white shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-zinc-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                <th className="px-5 py-4">Usuario</th>
                <th className="px-5 py-4">Rol</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-zinc-50 last:border-0 dark:border-zinc-800/80"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400">{u.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        u.isActive
                          ? 'text-[var(--color-forest)] dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-xs"
                      disabled={toggle.isPending}
                      onClick={() => handleToggle(u.id)}
                    >
                      {u.isActive ? 'Desactivar' : 'Activar'}
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
