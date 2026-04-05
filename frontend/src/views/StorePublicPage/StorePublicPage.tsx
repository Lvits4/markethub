import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

const DEFAULT_SORT: ProductSortBy = 'newest';

const filterFieldClass =
  'page-size-input w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-hidden transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-forest focus:ring-2 focus:ring-forest/25 dark:border-night-600 dark:bg-night-800/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-market-dark-accent dark:focus:ring-market-dark-accent/22';

const filterFieldsetClass = 'm-0 min-w-0 border-0 p-0';

function storeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0];
    const b = parts[parts.length - 1]?.[0];
    if (a && b) return `${a}${b}`.toUpperCase();
  }
  const compact = name.trim().replace(/\s+/g, '');
  if (compact.length >= 2) return compact.slice(0, 2).toUpperCase();
  if (compact.length === 1) return compact.toUpperCase();
  return '?';
}

export function StorePublicPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const {
    data: store,
    isLoading: storeLoading,
    isError: storeError,
  } = useStorePublicQuery(storeId);

  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [sortBy, setSortBy] = useState<ProductSortBy>(DEFAULT_SORT);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [draftSortBy, setDraftSortBy] = useState<ProductSortBy>(DEFAULT_SORT);
  const [draftCategoryId, setDraftCategoryId] = useState('');
  const [draftMinPrice, setDraftMinPrice] = useState('');
  const [draftMaxPrice, setDraftMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const filterPopoverRef = useRef<HTMLDivElement>(null);

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

  const handleClearFilters = () => {
    setPage(1);
    setCategoryId(undefined);
    setSortBy(DEFAULT_SORT);
    setMinPrice('');
    setMaxPrice('');
    setDraftCategoryId('');
    setDraftSortBy(DEFAULT_SORT);
    setDraftMinPrice('');
    setDraftMaxPrice('');
  };

  const handleApplyFilters = () => {
    setPage(1);
    setCategoryId(draftCategoryId === '' ? undefined : draftCategoryId);
    setSortBy(draftSortBy);
    setMinPrice(draftMinPrice);
    setMaxPrice(draftMaxPrice);
    setFilterPopoverOpen(false);
  };

  if (!storeId) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-sm text-zinc-500">Tienda no válida.</p>
        <Button
          type="button"
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
      <div className="mb-3">
        <button
          type="button"
          onClick={goBack}
          className="group -mx-1 inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-sm font-normal text-zinc-600 transition-colors hover:text-zinc-900 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-forest/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-cream dark:text-zinc-400 dark:hover:text-zinc-100 dark:focus-visible:ring-market-dark-accent/40 dark:focus-visible:ring-offset-night-base"
        >
          <FiArrowLeft
            className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:-translate-x-0.5"
            aria-hidden
          />
          Volver
        </button>
      </div>

      <section className="mb-8 overflow-hidden rounded-md bg-white shadow-market ring-1 ring-zinc-200/60 dark:bg-night-900 dark:shadow-market-dark dark:ring-night-800">
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(11rem,min(38vw,20rem))_1fr]">
          <div className="relative aspect-5/3 w-full min-h-44 border-b border-zinc-200 bg-zinc-100 dark:border-night-700 dark:bg-night-800 sm:aspect-auto sm:min-h-0 sm:border-b-0 sm:border-r">
            {store.logo ? (
              <img
                src={publicStorageImageSrc(store.logo)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-forest/30 to-zinc-200 dark:from-sky-600/28 dark:to-night-800"
                aria-hidden
              >
                <span className="text-4xl font-bold tracking-tight text-forest dark:text-market-dark-accent sm:text-5xl md:text-6xl">
                  {storeInitials(store.name)}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0 px-4 py-5 sm:px-6 sm:py-6">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              {store.name}
            </h1>
            {store.description ? (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:mt-3">
                {store.description}
              </p>
            ) : null}
            <div className="mt-5 border-t border-zinc-200 pt-5 dark:border-night-700 sm:mt-6">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Contacto
              </h2>
              {store.contactEmail || store.contactPhone ? (
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
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
              ) : (
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Esta tienda no publicó correo ni teléfono de contacto.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Productos de la tienda
      </h2>

      <div className="relative mb-5 flex min-h-[52px] items-stretch gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar en esta tienda…"
          className="min-h-[52px] min-w-0 flex-1"
        />
        <div
          className="relative flex shrink-0 self-stretch"
          ref={filterPopoverRef}
        >
          <Button
            type="button"
            className="h-full min-h-[52px] min-w-22 shrink-0 px-4 py-0"
            aria-expanded={filterPopoverOpen}
            aria-haspopup="dialog"
            onClick={() => {
              setFilterPopoverOpen((open) => {
                if (!open) {
                  setDraftCategoryId(categoryId ?? '');
                  setDraftSortBy(sortBy);
                  setDraftMinPrice(minPrice);
                  setDraftMaxPrice(maxPrice);
                }
                return !open;
              });
            }}
          >
            Filtrar
          </Button>
          {filterPopoverOpen ? (
            <div
              role="dialog"
              aria-label="Filtros y orden"
              className="catalog-filter-popover absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(calc(100vw-2rem),20rem)] rounded-xl border border-zinc-200/90 bg-white p-4 shadow-[0_16px_48px_-12px_rgb(0_0_0/0.18)] ring-1 ring-zinc-200/70 dark:border-night-600 dark:bg-night-900 dark:shadow-[0_20px_56px_-12px_rgb(0_0_0/0.55)] dark:ring-night-700/80"
            >
              <div className="flex flex-col gap-4">
                <fieldset className={filterFieldsetClass}>
                  <legend className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    Categoría
                  </legend>
                  <div className="mt-1">
                    <FormSelect
                      value={draftCategoryId}
                      onChange={setDraftCategoryId}
                      options={categorySelectOptions}
                      placeholder="Todas las categorías"
                      variant="field"
                      searchable
                      searchPlaceholder="Buscar categoría…"
                      listMaxHeightPx={320}
                      triggerClassName="!mt-0 rounded-lg border-zinc-200 bg-zinc-50 py-2.5 dark:border-night-600 dark:bg-night-800/80"
                      listClassName="rounded-xl border-zinc-200/90 dark:border-sky-500/25"
                    />
                  </div>
                </fieldset>
                <fieldset className={filterFieldsetClass}>
                  <legend className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    Orden
                  </legend>
                  <div className="mt-1">
                    <FormSelect
                      value={draftSortBy}
                      onChange={(v) => setDraftSortBy(v as ProductSortBy)}
                      options={SORT_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                      variant="field"
                      triggerClassName="!mt-0 rounded-lg border-zinc-200 bg-zinc-50 py-2.5 dark:border-night-600 dark:bg-night-800/80"
                      listClassName="rounded-xl border-zinc-200/90 dark:border-sky-500/25"
                    />
                  </div>
                </fieldset>
                <label className="flex flex-col gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  Precio mín.
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={draftMinPrice}
                    onChange={(e) => setDraftMinPrice(e.target.value)}
                    placeholder="0"
                    className={filterFieldClass}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  Precio máx.
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={draftMaxPrice}
                    onChange={(e) => setDraftMaxPrice(e.target.value)}
                    placeholder="∞"
                    className={filterFieldClass}
                  />
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

      <section
        className="relative min-h-48"
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
                  className="min-w-48 justify-center"
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
