import { useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import { routePaths } from '../../config/routes';
import { publicStorageImageSrc } from '../../helpers/storagePublicUrl';
import { usePublicStoresQuery } from '../../queries/usePublicStoresQuery';
import type { Store } from '../../types/store';

type SortMode = 'name_asc' | 'name_desc';

function matchesSearch(store: Store, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  return (
    store.name.toLowerCase().includes(n) ||
    store.slug.toLowerCase().includes(n) ||
    (store.description?.toLowerCase().includes(n) ?? false)
  );
}

export function StoresListPage() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [sort, setSort] = useState<SortMode>('name_asc');
  const [onlyWithLogo, setOnlyWithLogo] = useState(false);

  const { data: rawStores, isLoading, isError } = usePublicStoresQuery();

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

      <SearchInput value={search} onChange={setSearch} className="mb-4" />

      <details className="mb-6 rounded-md border border-zinc-200 bg-white/80 px-4 py-3 dark:border-night-700 dark:bg-night-900/50">
        <summary className="cursor-pointer text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Filtros
        </summary>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex min-w-[10rem] flex-col gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Ordenar por nombre
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[var(--color-forest)] dark:border-night-700 dark:bg-night-800/50 dark:text-zinc-100 dark:focus:border-[var(--color-market-dark-accent)]"
            >
              <option value="name_asc">A → Z</option>
              <option value="name_desc">Z → A</option>
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={onlyWithLogo}
              onChange={(e) => setOnlyWithLogo(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-[var(--color-forest)] focus:ring-[var(--color-forest)] dark:border-night-600 dark:bg-night-800"
            />
            Solo tiendas con logo
          </label>
        </div>
      </details>

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
                className="flex h-full flex-col overflow-hidden rounded-md bg-white shadow-[var(--shadow-market)] ring-1 ring-zinc-200/60 transition hover:shadow-md dark:bg-night-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-night-800"
              >
                <div className="relative aspect-[16/9] w-full bg-zinc-100 dark:bg-night-800">
                  {store.banner ? (
                    <img
                      src={publicStorageImageSrc(store.banner)}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : store.logo ? (
                    <img
                      src={publicStorageImageSrc(store.logo)}
                      alt=""
                      className="h-full w-full object-contain p-6"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400">
                      <FiShoppingBag className="h-14 w-14" aria-hidden />
                    </div>
                  )}
                </div>
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
