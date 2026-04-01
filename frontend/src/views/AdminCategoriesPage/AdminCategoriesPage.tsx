import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import toast from 'react-hot-toast';
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiEdit2,
  FiEye,
  FiSearch,
  FiTag,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { Button } from '../../components/Button/Button';
import { Modal } from '../../components/Modal/Modal';
import { AdminCreateCategoryForm } from '../../components/AdminCreateCategoryForm/AdminCreateCategoryForm';
import { AdminEditCategoryForm } from '../../components/AdminEditCategoryForm/AdminEditCategoryForm';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useDeleteCategoryMutation } from '../../hooks/useAdminCategoryMutations';
import { useCategoriesFlatQuery } from '../../queries/useCategoriesFlatQuery';
import type { Category } from '../../types/category';

type SortKey = 'name' | 'slug' | 'parent' | 'description';
type SortDir = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 10;
const NUM_COLS = 5;
const COL_WIDTH = `${100 / NUM_COLS}%`;

function CategoriesTableColgroup() {
  return (
    <colgroup>
      {Array.from({ length: NUM_COLS }, (__, i) => (
        <col key={i} style={{ width: COL_WIDTH }} />
      ))}
    </colgroup>
  );
}

function parentLabel(list: Category[], parentId: string | null): string {
  if (!parentId) return '—';
  const p = list.find((c) => c.id === parentId);
  return p?.name ?? parentId;
}

function matchesSearch(c: Category, list: Category[], q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  const chunks = [
    c.name,
    c.slug,
    c.description,
    c.id,
    parentLabel(list, c.parentId),
  ];
  return chunks.some((x) => (x ?? '').toLowerCase().includes(n));
}

function compareCategories(
  a: Category,
  b: Category,
  list: Category[],
  key: SortKey,
  dir: SortDir,
): number {
  let cmp = 0;
  switch (key) {
    case 'name':
      cmp = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      break;
    case 'slug':
      cmp = a.slug.localeCompare(b.slug, 'es', { sensitivity: 'base' });
      break;
    case 'parent':
      cmp = parentLabel(list, a.parentId).localeCompare(
        parentLabel(list, b.parentId),
        'es',
        { sensitivity: 'base' },
      );
      break;
    case 'description':
      cmp = (a.description ?? '').localeCompare(b.description ?? '', 'es');
      break;
    default:
      cmp = 0;
  }
  return dir === 'asc' ? cmp : -cmp;
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <div className="rounded-md border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-sky-500/20 dark:bg-[#0f1a38] dark:text-slate-200">
        {children}
      </div>
    </div>
  );
}

function CategoryDetailContent({ category, list }: { category: Category; list: Category[] }) {
  return (
    <div className="space-y-4 px-5 py-4">
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {category.name}
          </h3>
          <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {category.slug}
          </p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <DetailField label="Padre">
          {parentLabel(list, category.parentId)}
        </DetailField>
        <DetailField label="Descripción">
          {category.description?.trim() ? category.description : '—'}
        </DetailField>
      </div>
      <DetailField label="ID">
        <span className="break-all font-mono text-[11px]">{category.id}</span>
      </DetailField>
    </div>
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
  return (
    <th
      className={`px-4 py-3.5 ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <div
        className={`inline-flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}
      >
        <span className="leading-tight">{label}</span>
        <span className="inline-flex shrink-0 items-center gap-px">
          <button
            type="button"
            className={`rounded p-0 leading-none transition-colors hover:bg-slate-200 dark:hover:bg-sky-950/50 ${active && dir === 'asc' ? 'text-[var(--color-forest)] dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`}
            aria-label={`Ordenar ${label} ascendente`}
            onClick={() => onSort(sortKey, 'asc')}
          >
            <FiChevronUp className="h-3 w-3" aria-hidden />
          </button>
          <button
            type="button"
            className={`rounded p-0 leading-none transition-colors hover:bg-slate-200 dark:hover:bg-sky-950/50 ${active && dir === 'desc' ? 'text-[var(--color-forest)] dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`}
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

export function AdminCategoriesPage() {
  const { data: categories, isLoading, isError } = useCategoriesFlatQuery();
  const deleteCategoryMut = useDeleteCategoryMutation();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [viewCategory, setViewCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

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

  const list = Array.isArray(categories) ? categories : [];
  const sortedBase = useMemo(
    () => [...list].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [list],
  );

  const filteredSorted = useMemo(() => {
    const q = search.trim();
    const filtered = list.filter((c) => matchesSearch(c, list, q));
    return [...filtered].sort((a, b) =>
      compareCategories(a, b, list, sortKey, sortDir),
    );
  }, [list, search, sortKey, sortDir]);

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

  const busy = deleteCategoryMut.isPending;

  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;
    const id = categoryToDelete.id;
    deleteCategoryMut.mutate(id, {
      onSuccess: () => {
        toast.success('Categoría eliminada');
        setCategoryToDelete(null);
        setViewCategory((v) => (v?.id === id ? null : v));
        setEditCategory((e) => (e?.id === id ? null : e));
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h2 className="flex shrink-0 items-center gap-2.5 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        <FiTag className="h-7 w-7 shrink-0 text-zinc-900 dark:text-zinc-50" aria-hidden />
        Categorías
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Organiza el catálogo en categorías y subcategorías. Eliminar una
        categoría la borra del sistema; las subcategorías pasan a raíz y los
        productos vinculados quedan sin categoría hasta que los edites.
      </p>

      {isLoading ? (
        <p className="text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="text-center text-sm text-red-600">
          No se pudieron cargar las categorías.
        </p>
      ) : (
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
                placeholder="Buscar por nombre, slug, descripción, padre o ID…"
                className={`box-border h-11 w-full rounded-md border border-zinc-200 bg-white py-0 pl-10 text-sm leading-normal text-zinc-900 shadow-sm ring-zinc-200 placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]/25 dark:border-night-700 dark:bg-night-950 dark:text-zinc-50 dark:ring-night-800 ${search ? 'pr-11' : 'pr-4'}`}
                aria-label="Buscar categorías"
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
            <Button
              type="button"
              variant="primary"
              className="h-11 min-h-11 shrink-0 border-0 px-6 py-0 text-sm !bg-[#102251] !text-[#458bde] shadow-sm hover:!bg-[#152a5e] focus-visible:!ring-2 focus-visible:!ring-[#458bde]/35 dark:!bg-[#102251] dark:!text-[#458bde] dark:hover:!bg-[#152a5e]"
              onClick={() => setCreateOpen(true)}
            >
              Nueva categoría
            </Button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-[#f4f7fc]/92 shadow-[0_8px_32px_rgb(15_23_42/0.07)] backdrop-blur-xl dark:border-sky-500/25 dark:bg-[#0a1228]/92 dark:shadow-[0_24px_56px_-16px_rgb(0_0_0/0.55),inset_0_1px_0_0_rgb(56_189_248/0.11)] dark:backdrop-blur-xl">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div
                ref={tableHeaderScrollRef}
                onScroll={onTableHeaderScroll}
                className="no-scrollbar shrink-0 overflow-x-auto overflow-y-hidden border-b border-slate-200/80 dark:border-sky-500/20"
              >
                <table className="w-full min-w-[960px] table-fixed border-collapse text-left text-sm">
                  <CategoriesTableColgroup />
                  <thead className="bg-slate-100/92 backdrop-blur-md dark:bg-[#0f1a38]/95 dark:backdrop-blur-md">
                    <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      <SortHeader
                        label="Nombre"
                        sortKey="name"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Slug"
                        sortKey="slug"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Padre"
                        sortKey="parent"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Descripción"
                        sortKey="description"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                        Acción
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div
                ref={tableBodyScrollRef}
                onScroll={onTableBodyScroll}
                className="market-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto"
              >
                <table className="w-full min-w-[960px] table-fixed border-collapse text-left text-sm">
                  <CategoriesTableColgroup />
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={NUM_COLS}
                          className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                        >
                          {list.length === 0
                            ? 'No hay categorías activas.'
                            : 'Ninguna categoría coincide con la búsqueda.'}
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b border-slate-200/55 transition-colors last:border-0 hover:bg-slate-50/90 dark:border-sky-500/[0.12] dark:hover:bg-sky-950/20"
                        >
                          <td className="px-4 py-2 align-middle">
                            <p className="font-medium leading-tight text-slate-900 dark:text-slate-100">
                              {c.name}
                            </p>
                          </td>
                          <td className="min-w-0 truncate px-4 py-2 align-middle font-mono text-xs text-slate-600 dark:text-slate-400">
                            {c.slug}
                          </td>
                          <td className="min-w-0 truncate px-4 py-2 align-middle text-slate-700 dark:text-slate-300">
                            {parentLabel(list, c.parentId)}
                          </td>
                          <td className="min-w-0 truncate px-4 py-2 align-middle text-slate-600 dark:text-slate-400">
                            {c.description?.trim() ? c.description : '—'}
                          </td>
                          <td className="px-4 py-2 align-middle text-center">
                            <div className="flex flex-nowrap items-center justify-center gap-1.5">
                              <Button
                                type="button"
                                variant="icon"
                                className="!text-[#2563eb] hover:bg-blue-500/10 dark:!text-sky-400 dark:hover:bg-sky-500/15"
                                aria-label={`Ver detalle de ${c.name}`}
                                onClick={() => setViewCategory(c)}
                              >
                                <FiEye className="h-4 w-4" aria-hidden />
                              </Button>
                              <Button
                                type="button"
                                variant="icon"
                                className="!text-[#1d4ed8] hover:bg-blue-500/10 dark:!text-sky-300 dark:hover:bg-sky-500/15"
                                aria-label={`Editar ${c.name}`}
                                disabled={busy}
                                onClick={() => setEditCategory(c)}
                              >
                                <FiEdit2 className="h-4 w-4" aria-hidden />
                              </Button>
                              <Button
                                type="button"
                                variant="icon"
                                className="!text-red-600 hover:bg-red-500/10 dark:!text-red-400 dark:hover:bg-red-950/35"
                                disabled={busy}
                                aria-label={`Eliminar ${c.name}`}
                                onClick={() => setCategoryToDelete(c)}
                              >
                                <FiTrash2 className="h-4 w-4" aria-hidden />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-3 border-t border-slate-200/80 bg-slate-50/75 px-4 py-3 backdrop-blur-sm dark:border-sky-500/18 dark:bg-[#0c1630]/88 dark:backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {filteredSorted.length === 0
                    ? '0 categorías'
                    : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filteredSorted.length)} de ${filteredSorted.length}`}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Página{' '}
                  <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                    {page}
                  </span>{' '}
                  de{' '}
                  <span className="tabular-nums">{totalPages}</span>
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 min-w-8 px-2"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Página anterior"
                  >
                    <FiChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 min-w-8 px-2"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Página siguiente"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Por página</span>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={pageSize}
                    onChange={(e) => {
                      const raw = Number(e.target.value);
                      if (!Number.isFinite(raw)) return;
                      const next = Math.min(999, Math.max(1, Math.trunc(raw)));
                      setPageSize(next);
                    }}
                    className="page-size-input h-9 w-16 rounded-md border border-slate-300 bg-white px-2 text-center text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/25 dark:border-sky-500/30 dark:bg-[#0b1735] dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/25"
                    aria-label="Cantidad de elementos por página"
                  />
                </label>
              </div>
            </div>
          </div>

          <Modal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            title="Nueva categoría"
          >
            <div className="min-h-0 flex-1 overflow-hidden">
              <AdminCreateCategoryForm
                categories={sortedBase}
                onSuccess={() => setCreateOpen(false)}
                onCancel={() => setCreateOpen(false)}
              />
            </div>
          </Modal>

          <Modal
            open={viewCategory != null}
            onClose={() => setViewCategory(null)}
            title={viewCategory ? `Detalle: ${viewCategory.name}` : 'Detalle'}
          >
            <div className="min-h-0 flex-1 overflow-hidden">
              {viewCategory ? (
                <CategoryDetailContent category={viewCategory} list={list} />
              ) : null}
            </div>
          </Modal>

          <Modal
            open={editCategory != null}
            onClose={() => setEditCategory(null)}
            title={
              editCategory ? `Editar: ${editCategory.name}` : 'Editar categoría'
            }
          >
            <div className="min-h-0 flex-1 overflow-hidden">
              {editCategory ? (
                <AdminEditCategoryForm
                  key={editCategory.id}
                  category={editCategory}
                  categories={list}
                  onSuccess={() => setEditCategory(null)}
                  onCancel={() => setEditCategory(null)}
                />
              ) : null}
            </div>
          </Modal>

          <Modal
            open={categoryToDelete != null}
            onClose={() => setCategoryToDelete(null)}
            title="Confirmar eliminación"
          >
            <div className="space-y-4 px-5 py-4">
              <p className="text-sm text-zinc-700 dark:text-zinc-200">
                ¿Seguro que quieres eliminar la categoría{' '}
                <span className="font-semibold">
                  «{categoryToDelete?.name}»
                </span>
                ?
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Las subcategorías pasarán a nivel raíz y los productos que la
                usaban quedarán sin categoría. No se puede deshacer.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50/90 px-5 py-4 dark:border-night-800 dark:bg-night-950/90">
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-40 justify-center border border-zinc-300 bg-white px-4 text-sm text-zinc-800 hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700"
                onClick={() => setCategoryToDelete(null)}
                disabled={deleteCategoryMut.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                className="h-10 w-40 justify-center border-0 bg-rose-700/90 px-4 text-sm text-white hover:bg-rose-800 dark:bg-rose-700/90 dark:hover:bg-rose-800"
                onClick={handleConfirmDelete}
                disabled={deleteCategoryMut.isPending}
              >
                {deleteCategoryMut.isPending ? 'Eliminando…' : 'Eliminar categoría'}
              </Button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
