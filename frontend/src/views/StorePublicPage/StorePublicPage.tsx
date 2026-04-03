import { useDeferredValue, useEffect, useId, useMemo, useState } from 'react';
import { FiArrowLeft, FiMail, FiPhone } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { FormSelect } from '../../components/CreateProductForm/FormSelect';
import { MarketProductCard } from '../../components/MarketProductCard/MarketProductCard';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import { routePaths } from '../../config/routes';
import { publicStorageImageSrc } from '../../helpers/storagePublicUrl';
import { useAccumulatedProductList } from '../../hooks/useAccumulatedProductList';
import { useCategoriesFlatQuery } from '../../queries/useCategoriesFlatQuery';
import { useProductsByStoreQuery } from '../../queries/useProductsByStoreQuery';
import { useStorePublicQuery } from '../../queries/useStorePublicQuery';
import type { ProductSortBy } from '../../types/product';

const SORT_OPTIONS: { value: ProductSortBy; label: string }[] = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor' },
  { value: 'price_desc', label: 'Precio: mayor' },
  { value: 'best_selling', label: 'Más vendidos' },
];

export function StorePublicPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const storeCategoryFieldId = useId();
  const {
    data: store,
    isLoading: storeLoading,
    isError: storeError,
  } = useStorePublicQuery(storeId);

  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [sortBy, setSortBy] = useState<ProductSortBy>('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);

  const minNum = minPrice.trim() === '' ? undefined : Number.parseFloat(minPrice);
  const maxNum = maxPrice.trim() === '' ? undefined : Number.parseFloat(maxPrice);

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        storeId,
        categoryId,
        search: deferredSearch.trim(),
        sortBy,
        minPrice: minNum,
        maxPrice: maxNum,
      }),
    [storeId, categoryId, deferredSearch, sortBy, minNum, maxNum],
  );

  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  const productFilters = useMemo(
    () => ({
      page,
      limit: 12,
      search: deferredSearch.trim() || undefined,
      categoryId,
      sortBy,
      minPrice:
        minNum !== undefined && !Number.isNaN(minNum) && minNum >= 0
          ? minNum
          : undefined,
      maxPrice:
        maxNum !== undefined && !Number.isNaN(maxNum) && maxNum >= 0
          ? maxNum
          : undefined,
    }),
    [
      page,
      deferredSearch,
      categoryId,
      sortBy,
      minNum,
      maxNum,
    ],
  );

  const {
    data: productsData,
    isPending,
    isError,
    isFetching,
    isPlaceholderData,
  } = useProductsByStoreQuery(storeId, productFilters);

  const accumulated = useAccumulatedProductList(
    page,
    productsData,
    isPlaceholderData,
  );

  const { data: categories } = useCategoriesFlatQuery();

  const categorySelectOptions = useMemo(
    () => [
      { value: '', label: 'Todas las categorías' },
      ...(categories ?? []).map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories],
  );

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(routePaths.stores);
    }
  };

  if (!storeId) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-sm text-zinc-500">Tienda no válida.</p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => navigate(routePaths.stores)}
        >
          Ver tiendas
        </Button>
      </div>
    );
  }

  if (storeLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-zinc-500">
        Cargando tienda…
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-sm text-red-600">No se encontró esta tienda.</p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => navigate(routePaths.stores)}
        >
          Ver todas las tiendas
        </Button>
      </div>
    );
  }

  const totalPages = productsData?.totalPages ?? 0;
  const canLoadMore = page < totalPages;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-4 sm:pt-6">
      <div className="mb-4">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-night-800"
        >
          <FiArrowLeft className="h-4 w-4" aria-hidden />
          Volver
        </button>
      </div>

      <section className="mb-8 overflow-hidden rounded-md bg-white shadow-[var(--shadow-market)] ring-1 ring-zinc-200/60 dark:bg-night-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-night-800">
        <div className="relative h-40 bg-zinc-200 dark:bg-night-800 sm:h-48">
          {store.banner ? (
            <img
              src={publicStorageImageSrc(store.banner)}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--color-forest)]/20 to-zinc-200 dark:from-sky-600/18 dark:to-night-800" />
          )}
          {store.logo ? (
            <div className="absolute -bottom-10 left-4 sm:left-6">
              <div className="h-20 w-20 overflow-hidden rounded-md border-4 border-white bg-white shadow-md dark:border-night-900 sm:h-24 sm:w-24">
                <img
                  src={publicStorageImageSrc(store.logo)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>
        <div className={`px-4 pb-6 pt-12 sm:px-6 ${store.logo ? 'sm:pt-14' : 'pt-6'}`}>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            {store.name}
          </h1>
          {store.description ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {store.description}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {store.contactEmail ? (
              <a
                href={`mailto:${store.contactEmail}`}
                className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 font-medium text-zinc-800 transition hover:bg-zinc-200 dark:bg-night-800 dark:text-zinc-200 dark:hover:bg-night-700"
              >
                <FiMail className="h-4 w-4 shrink-0" aria-hidden />
                {store.contactEmail}
              </a>
            ) : null}
            {store.contactPhone ? (
              <a
                href={`tel:${store.contactPhone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 font-medium text-zinc-800 transition hover:bg-zinc-200 dark:bg-night-800 dark:text-zinc-200 dark:hover:bg-night-700"
              >
                <FiPhone className="h-4 w-4 shrink-0" aria-hidden />
                {store.contactPhone}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Productos de la tienda
      </h2>

      <SearchInput value={search} onChange={setSearch} className="mb-4" />

      <details className="mb-5 rounded-md border border-zinc-200 bg-white/80 px-4 py-3 dark:border-night-700 dark:bg-night-900/50">
        <summary className="cursor-pointer text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Filtros y orden
        </summary>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
              htmlFor={storeCategoryFieldId}
            >
              Categoría
            </label>
            <FormSelect
              id={storeCategoryFieldId}
              value={categoryId ?? ''}
              onChange={(v) => setCategoryId(v === '' ? undefined : v)}
              options={categorySelectOptions}
              placeholder="Todas las categorías"
              variant="field"
              searchable
              searchPlaceholder="Buscar categoría…"
              listMaxHeightPx={320}
              triggerClassName="!mt-0 rounded-lg border-zinc-200 bg-zinc-50/80 py-2.5 dark:border-night-700 dark:bg-night-800/50"
              listClassName="rounded-xl border-zinc-200/90 dark:border-sky-500/25"
            />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex min-w-[10rem] flex-col gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Orden
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as ProductSortBy)
              }
              className="rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[var(--color-forest)] dark:border-night-700 dark:bg-night-800/50 dark:text-zinc-100 dark:focus:border-[var(--color-market-dark-accent)]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[6rem] flex-col gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Precio mín.
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[var(--color-forest)] dark:border-night-700 dark:bg-night-800/50 dark:text-zinc-100 dark:focus:border-[var(--color-market-dark-accent)]"
            />
          </label>
          <label className="flex min-w-[6rem] flex-col gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Precio máx.
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="∞"
              className="rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[var(--color-forest)] dark:border-night-700 dark:bg-night-800/50 dark:text-zinc-100 dark:focus:border-[var(--color-market-dark-accent)]"
            />
          </label>
          </div>
        </div>
      </details>

      <section
        className="relative min-h-[12rem]"
        aria-label="Listado de productos"
        aria-live="polite"
      >
        {isFetching && page === 1 && !isPending ? (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/65 backdrop-blur-[2px] dark:bg-night-950/55"
            aria-hidden
          >
            <span className="rounded-full border border-zinc-200/90 bg-white/95 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm dark:border-night-600 dark:bg-night-900/95 dark:text-zinc-200">
              Actualizando…
            </span>
          </div>
        ) : null}
        {isPending && page === 1 ? (
          <p className="py-12 text-center text-sm text-zinc-500">Cargando…</p>
        ) : isError ? (
          <p className="py-12 text-center text-sm text-red-600">
            No se pudieron cargar los productos.
          </p>
        ) : !accumulated.length &&
          !(isFetching && page === 1 && !isPending) ? (
          <p className="py-12 text-center text-sm text-zinc-500">
            No hay productos con estos filtros.
          </p>
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-4 pb-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {accumulated.map((item) => (
                <li key={item.id}>
                  <MarketProductCard item={item} />
                </li>
              ))}
            </ul>
            {canLoadMore ? (
              <div className="flex justify-center pb-8">
                <Button
                  type="button"
                  variant="outline"
                  className="min-w-[12rem] justify-center"
                  disabled={isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {isFetching ? 'Cargando…' : 'Cargar más'}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
