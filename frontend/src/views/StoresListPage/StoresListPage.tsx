import {
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { FormSelect } from '../../components/CreateProductForm/FormSelect';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import { routePaths } from '../../config/routes';
import { publicStorageImageSrc } from '../../helpers/storagePublicUrl';
import { usePublicStoresQuery } from '../../queries/usePublicStoresQuery';
import type { Store } from '../../types/store';

type SortMode = 'name_asc' | 'name_desc';

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'name_asc', label: 'A → Z' },
  { value: 'name_desc', label: 'Z → A' },
];

const DEFAULT_SORT: SortMode = 'name_asc';

function matchesSearch(store: Store, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  return (
    store.name.toLowerCase().includes(n) ||
    store.slug.toLowerCase().includes(n) ||
    (store.description?.toLowerCase().includes(n) ?? false)
  );
}

/** Contenedor fijo + `object-cover` (como productos); formato 16:9 para que no ocupen tanto alto como un cuadrado. */
function StoreCardMedia({ store }: { store: Store }) {
  const { banner, logo, name } = store;
  const candidates = useMemo(() => {
    const b = banner?.trim();
    const l = logo?.trim();
    const list: string[] = [];
    if (b) list.push(b);
    if (l && l !== b) list.push(l);
    return list;
  }, [banner, logo]);

  const [srcIndex, setSrcIndex] = useState(0);

  useEffect(() => {
    setSrcIndex(0);
  }, [banner, logo]);

  const src = srcIndex < candidates.length ? candidates[srcIndex] : null;

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-night-800">
      {src ? (
        <img
          key={`${store.id}-${srcIndex}`}
          src={publicStorageImageSrc(src)}
          alt={name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          onError={() => setSrcIndex((i) => i + 1)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
          Sin imagen
        </div>
      )}
    </div>
  );
}

export function StoresListPage() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [sort, setSort] = useState<SortMode>(DEFAULT_SORT);
  const [onlyWithLogo, setOnlyWithLogo] = useState(false);
  const [draftSort, setDraftSort] = useState<SortMode>(DEFAULT_SORT);
  const [draftOnlyWithLogo, setDraftOnlyWithLogo] = useState(false);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const filterPopoverRef = useRef<HTMLDivElement>(null);
  const storesSortFieldId = useId();

  const { data: rawStores, isLoading, isError } = usePublicStoresQuery();

  useEffect(() => {
    if (!filterPopoverOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target;
      if (
        t instanceof Element &&
        t.closest('[data-markethub-select-list]')
      ) {
        return;
      }
      const el = filterPopoverRef.current;
      if (el && !el.contains(t as Node)) {
        setFilterPopoverOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFilterPopoverOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [filterPopoverOpen]);

  const filtered = useMemo(() => {
    let list = Array.isArray(rawStores) ? [...rawStores] : [];
    list = list.filter((s) => matchesSearch(s, deferredSearch.trim()));
    if (onlyWithLogo) {
      list = list.filter((s) => Boolean(s.logo?.trim()));
    }
    list.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      return sort === 'name_asc' ? cmp : -cmp;
    });
    return list;
  }, [rawStores, deferredSearch, onlyWithLogo, sort]);

  const handleClearFilters = () => {
    setSort(DEFAULT_SORT);
    setOnlyWithLogo(false);
    setDraftSort(DEFAULT_SORT);
    setDraftOnlyWithLogo(false);
  };

  const handleApplyFilters = () => {
    setSort(draftSort);
    setOnlyWithLogo(draftOnlyWithLogo);
    setFilterPopoverOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:pt-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Tiendas
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Explora vendedores aprobados y entra en su catálogo.
        </p>
      </header>

      <div className="relative mb-5 flex min-h-[52px] items-stretch gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar tiendas…"
          className="min-h-[52px] min-w-0 flex-1"
        />
        <div
          className="relative flex shrink-0 self-stretch"
          ref={filterPopoverRef}
        >
          <Button
            type="button"
            variant="outline"
            className="h-full min-h-[52px] min-w-[5.5rem] shrink-0 px-4 py-0"
            aria-expanded={filterPopoverOpen}
            aria-controls="stores-filter-popover"
            aria-haspopup="dialog"
            onClick={() => {
              setFilterPopoverOpen((open) => {
                if (!open) {
                  setDraftSort(sort);
                  setDraftOnlyWithLogo(onlyWithLogo);
                }
                return !open;
              });
            }}
          >
            Filtrar
          </Button>
          {filterPopoverOpen ? (
            <div
              id="stores-filter-popover"
              role="dialog"
              aria-label="Filtros y orden"
              className="catalog-filter-popover absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(calc(100vw-2rem),20rem)] rounded-xl border border-zinc-200/90 bg-white p-4 shadow-[0_16px_48px_-12px_rgb(0_0_0/0.18)] ring-1 ring-zinc-200/70 dark:border-night-600 dark:bg-night-900 dark:shadow-[0_20px_56px_-12px_rgb(0_0_0/0.55)] dark:ring-night-700/80"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-medium text-zinc-600 dark:text-zinc-300"
                    htmlFor={storesSortFieldId}
                  >
                    Orden
                  </label>
                  <FormSelect
                    id={storesSortFieldId}
                    value={draftSort}
                    onChange={(v) => setDraftSort(v as SortMode)}
                    options={SORT_OPTIONS.map((o) => ({
                      value: o.value,
                      label: o.label,
                    }))}
                    variant="field"
                    triggerClassName="!mt-0 rounded-lg border-zinc-200 bg-zinc-50 py-2.5 dark:border-night-600 dark:bg-night-800/80"
                    listClassName="rounded-xl border-zinc-200/90 dark:border-sky-500/25"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={draftOnlyWithLogo}
                    onChange={(e) => setDraftOnlyWithLogo(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-[var(--color-forest)] focus:ring-[var(--color-forest)] dark:border-night-600 dark:bg-night-800"
                  />
                  Solo tiendas con logo
                </label>
                <div className="mt-1 flex gap-2 border-t border-zinc-200/80 pt-4 dark:border-night-700">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 justify-center py-2.5 text-sm"
                    onClick={handleClearFilters}
                  >
                    Limpiar
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="flex-1 justify-center py-2.5 text-sm"
                    onClick={handleApplyFilters}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="py-16 text-center text-sm text-red-600">
          No se pudieron cargar las tiendas.
        </p>
      ) : !filtered.length ? (
        <p className="py-16 text-center text-sm text-zinc-500">
          Ninguna tienda coincide con tu búsqueda.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {filtered.map((store) => (
            <li key={store.id}>
              <Link
                to={routePaths.storeDetail(store.id)}
                className="group flex h-full flex-col overflow-hidden rounded-md bg-white shadow-[var(--shadow-market)] ring-1 ring-zinc-200/60 transition hover:shadow-md dark:bg-night-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-night-800"
              >
                <StoreCardMedia store={store} />
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {store.name}
                  </h2>
                  {store.description ? (
                    <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                      {store.description}
                    </p>
                  ) : null}
                  <span className="mt-auto pt-2 text-sm font-semibold text-[var(--color-forest)]">
                    Ver tienda
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
