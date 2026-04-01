import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../Button/Button';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useCreateCategoryMutation } from '../../hooks/useAdminCategoryMutations';
import type { Category } from '../../types/category';

const fieldClass =
  'mt-0.5 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/20 dark:border-night-700 dark:bg-night-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20';

const labelClass = 'text-xs font-medium text-zinc-600 dark:text-zinc-300';

export type AdminCreateCategoryFormProps = {
  /** Lista plana ordenada para el desplegable de padre */
  categories: Category[];
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function AdminCreateCategoryForm({
  categories,
  onSuccess,
  onCancel,
}: AdminCreateCategoryFormProps) {
  const createMut = useCreateCategoryMutation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');

  const busy = createMut.isPending;

  const handleSubmit = () => {
    const n = name.trim();
    if (!n) {
      toast.error('El nombre es obligatorio');
      return;
    }
    createMut.mutate(
      {
        name: n,
        description: description.trim() || undefined,
        parentId: parentId || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Categoría creada');
          setName('');
          setDescription('');
          setParentId('');
          onSuccess?.();
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <div className="market-scroll min-h-0 max-h-[min(60vh,520px)] flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:max-h-[min(65vh,580px)]">
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="create-cat-name" className={labelClass}>
              Nombre <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <input
              id="create-cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              disabled={busy}
              placeholder="Ej. Hogar"
            />
          </div>
          <div>
            <label htmlFor="create-cat-desc" className={labelClass}>
              Descripción (opcional)
            </label>
            <input
              id="create-cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={fieldClass}
              disabled={busy}
            />
          </div>
          <div>
            <label htmlFor="create-cat-parent" className={labelClass}>
              Categoría padre (opcional)
            </label>
            <select
              id="create-cat-parent"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className={fieldClass}
              disabled={busy}
            >
              <option value="">— Ninguna —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="flex w-full shrink-0 flex-col gap-2 border-t border-zinc-100 bg-zinc-50/90 px-5 py-4 dark:border-night-800 dark:bg-night-950/90 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <div className="flex w-full gap-2 sm:w-auto">
          {onCancel ? (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={onCancel}
              className="h-11 min-h-11 min-w-0 flex-1 basis-0 justify-center border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700 sm:flex-none sm:min-w-[7.5rem]"
            >
              Cancelar
            </Button>
          ) : null}
          <Button
            type="button"
            variant="primary"
            disabled={busy}
            onClick={handleSubmit}
            className="h-11 min-h-11 min-w-0 flex-1 justify-center border-0 px-3 text-sm !bg-[#102251] !text-[#458bde] shadow-sm hover:!bg-[#152a5e] focus-visible:!ring-2 focus-visible:!ring-[#458bde]/35 dark:!bg-[#102251] dark:!text-[#458bde] dark:hover:!bg-[#152a5e] sm:min-w-[11rem]"
          >
            {busy ? 'Creando…' : 'Crear categoría'}
          </Button>
        </div>
      </div>
    </form>
  );
}
