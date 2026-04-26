import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { useSellerCreateStoreModal } from '../../context/SellerCreateStoreModalProvider/SellerCreateStoreModalProvider';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError';
import {
  useDeleteStoreMutation,
  useUpdateStoreMutation,
} from '../../hooks/useStoreMutations';
import { useMyStoresQuery } from '../../queries/useMyStoresQuery';

export function SellerMyStoresPanel() {
  const { data, isLoading, isError } = useMyStoresQuery();
  const updateMut = useUpdateStoreMutation();
  const deleteMut = useDeleteStoreMutation();
  const { openCreateStoreModal } = useSellerCreateStoreModal();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const startEdit = (id: string, n: string, d: string | null) => {
    setEditingId(id);
    setEditName(n);
    setEditDescription(d ?? '');
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <section aria-label="Mis tiendas">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Crea tiendas y gestiona su información. Las nuevas quedan pendientes de aprobación del administrador.
        </p>
        <Button
          type="button"
          variant="primary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openCreateStoreModal();
          }}
        >
          Crear tienda
        </Button>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="py-8 text-center text-sm text-red-600">
          No se pudieron cargar las tiendas.
        </p>
      ) : !data?.length ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          No tienes tiendas todavía.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {data.map((s) => (
            <li
              key={s.id}
              className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-sm dark:shadow-none"
            >
              {editingId === s.id ? (
                <div className="space-y-3">
          <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-2 text-sm dark:border-night-700 dark:bg-night-950"
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-2 text-sm dark:border-night-700 dark:bg-night-950"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      disabled={updateMut.isPending}
                      onClick={() => {
                        const n = editName.trim();
                        if (!n) {
                          toast.error('El nombre es obligatorio');
                          return;
                        }
                        updateMut.mutate(
                          {
                            id: s.id,
                            body: {
                              name: n,
                              description: editDescription.trim() || undefined,
                            },
                          },
                          {
                            onSuccess: () => {
                              toast.success('Tienda actualizada');
                              cancelEdit();
                            },
                            onError: (e) => toast.error(getErrorMessage(e)),
                          },
                        );
                      }}
                    >
                      Guardar
                    </Button>
                    <Button type="button" variant="ghost" onClick={cancelEdit}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {s.name}
                      </p>
                      <p className="text-xs text-zinc-500">{s.slug}</p>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                        {s.isApproved ? (
                          <span className="text-forest">
                            Aprobada
                          </span>
                        ) : (
                          <span className="text-amber-600">
                            Pendiente de aprobación
                          </span>
                        )}
                      </p>
                    </div>
                    <Link
                      to={routePaths.sellerStoreProducts(s.id)}
                      className="inline-flex items-center justify-center rounded-md border-2 border-forest px-5 py-2 text-sm font-medium text-forest hover:bg-forest/8 dark:border-[color:rgb(69_139_222/0.45)]"
                    >
                      Productos
                    </Link>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--admin-border)] pt-4 dark:border-night-800">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => startEdit(s.id, s.name, s.description)}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-600"
                      disabled={deleteMut.isPending}
                      onClick={() => {
                        if (
                          !window.confirm(
                            '¿Eliminar esta tienda y sus datos asociados?',
                          )
                        ) {
                          return;
                        }
                        deleteMut.mutate(s.id, {
                          onSuccess: () => toast.success('Tienda eliminada'),
                          onError: (e) => toast.error(getErrorMessage(e)),
                        });
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
