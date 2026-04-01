import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/Button/Button';
import { getErrorMessage } from '../../helpers/mapApiError';
import {
  useCreateCategoryMutation,
  useDeactivateCategoryMutation,
  useUpdateCategoryMutation,
} from '../../hooks/useAdminCategoryMutations';
import { useCategoriesFlatQuery } from '../../queries/useCategoriesFlatQuery';
import type { Category } from '../../types/category';

function parentLabel(list: Category[], parentId: string | null) {
  if (!parentId) return '—';
  const p = list.find((c) => c.id === parentId);
  return p?.name ?? parentId;
}

export function AdminCategoriesPage() {
  const { data: categories, isLoading, isError } = useCategoriesFlatQuery();
  const createMut = useCreateCategoryMutation();
  const updateMut = useUpdateCategoryMutation();
  const deactivateMut = useDeactivateCategoryMutation();

  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newParentId, setNewParentId] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editParentId, setEditParentId] = useState('');

  const sorted = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const parentOptions = useMemo(() => {
    return sorted.filter((c) => c.id !== editingId);
  }, [sorted, editingId]);

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditDescription(c.description ?? '');
    setEditParentId(c.parentId ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const submitCreate = () => {
    const name = newName.trim();
    if (!name) {
      toast.error('El nombre es obligatorio');
      return;
    }
    createMut.mutate(
      {
        name,
        description: newDescription.trim() || undefined,
        parentId: newParentId || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Categoría creada');
          setNewName('');
          setNewDescription('');
          setNewParentId('');
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  const submitUpdate = () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) {
      toast.error('El nombre es obligatorio');
      return;
    }
    updateMut.mutate(
      {
        id: editingId,
        body: {
          name,
          description: editDescription.trim() || undefined,
          parentId: editParentId || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('Categoría actualizada');
          cancelEdit();
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  const onDeactivate = (id: string) => {
    deactivateMut.mutate(id, {
      onSuccess: () => toast.success('Categoría desactivada'),
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  const busy =
    createMut.isPending || updateMut.isPending || deactivateMut.isPending;

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Categorías
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Alta, edición y baja lógica (
        <code className="rounded-md bg-zinc-100 px-1 text-xs dark:bg-night-800">
          POST/PATCH/DELETE /categories
        </code>
        ). El listado muestra solo categorías activas; las desactivadas dejan
        de aparecer en el catálogo público.
      </p>

      <section className="mt-8 rounded-md bg-white p-6 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-night-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-night-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Nueva categoría
        </h3>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[180px] flex-1">
            <label className="text-xs font-medium text-zinc-500" htmlFor="cat-name">
              Nombre
            </label>
            <input
              id="cat-name"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-night-700 dark:bg-night-950"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej. Hogar"
            />
          </div>
          <div className="min-w-[180px] flex-1">
            <label
              className="text-xs font-medium text-zinc-500"
              htmlFor="cat-desc"
            >
              Descripción (opcional)
            </label>
            <input
              id="cat-desc"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-night-700 dark:bg-night-950"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
          <div className="min-w-[160px]">
            <label
              className="text-xs font-medium text-zinc-500"
              htmlFor="cat-parent"
            >
              Padre (opcional)
            </label>
            <select
              id="cat-parent"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-night-700 dark:bg-night-950"
              value={newParentId}
              onChange={(e) => setNewParentId(e.target.value)}
            >
              <option value="">— Ninguna —</option>
              {sorted.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            variant="primary"
            className="text-sm"
            disabled={busy}
            onClick={submitCreate}
          >
            Crear
          </Button>
        </div>
      </section>

      {isLoading ? (
        <p className="mt-10 text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="mt-10 text-center text-sm text-red-600">
          No se pudieron cargar las categorías.
        </p>
      ) : !sorted.length ? (
        <p className="mt-10 text-center text-sm text-zinc-500">
          No hay categorías activas.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-md bg-white shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-night-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-night-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-night-800">
                <th className="px-5 py-4">Nombre</th>
                <th className="px-5 py-4">Padre</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) =>
                editingId === c.id ? (
                  <tr
                    key={c.id}
                    className="border-b border-zinc-50 bg-zinc-50/80 dark:border-night-800/80 dark:bg-night-800/40"
                  >
                    <td className="px-5 py-4" colSpan={3}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                        <div className="min-w-[140px] flex-1">
                          <label className="text-xs text-zinc-500">Nombre</label>
                          <input
                            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-night-700 dark:bg-night-950"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        </div>
                        <div className="min-w-[140px] flex-1">
                          <label className="text-xs text-zinc-500">
                            Descripción
                          </label>
                          <input
                            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-night-700 dark:bg-night-950"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                          />
                        </div>
                        <div className="min-w-[140px]">
                          <label className="text-xs text-zinc-500">Padre</label>
                          <select
                            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-night-700 dark:bg-night-950"
                            value={editParentId}
                            onChange={(e) => setEditParentId(e.target.value)}
                          >
                            <option value="">— Ninguna —</option>
                            {parentOptions.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="primary"
                            className="text-xs"
                            disabled={busy}
                            onClick={submitUpdate}
                          >
                            Guardar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-xs"
                            disabled={busy}
                            onClick={cancelEdit}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={c.id}
                    className="border-b border-zinc-50 last:border-0 dark:border-night-800/80"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        {c.name}
                      </p>
                      <p className="text-xs text-zinc-500">{c.slug}</p>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                      {parentLabel(sorted, c.parentId)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-xs"
                          disabled={busy}
                          onClick={() => startEdit(c)}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="text-xs"
                          disabled={busy}
                          onClick={() => onDeactivate(c.id)}
                        >
                          Desactivar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
