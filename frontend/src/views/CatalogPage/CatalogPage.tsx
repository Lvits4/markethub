import {
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from '../../components/Button/Button';
import { FormSelect } from '../../components/CreateProductForm/FormSelect';
import { MarketProductCard } from '../../components/MarketProductCard/MarketProductCard';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import { marketingCopy } from '../../data/marketingCopy';
import { useAccumulatedProductList } from '../../hooks/useAccumulatedProductList';
import { useCategoriesFlatQuery } from '../../queries/useCategoriesFlatQuery';
import { useProductsListQuery } from '../../queries/useProductsListQuery';
import type { ProductSortBy } from '../../types/product';

const SORT_OPTIONS: { value: ProductSortBy; label: string }[] = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor' },
  { value: 'price_desc', label: 'Precio: mayor' },
  { value: 'best_selling', label: 'Más vendidos' },
];

const DEFAULT_SORT: ProductSortBy = 'newest';

const filterFieldClass =
  'page-size-input w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/25 dark:border-night-600 dark:bg-night-800/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[var(--color-market-dark-accent)] dark:focus:ring-[color:rgb(69_139_222/0.22)]';

export function CatalogPage() {
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
  const catalogSortFieldId = useId();
  const catalogCategoryFieldId = useId();

  const minNum = minPrice.trim() === '' ? undefined : Number.parseFloat(minPrice);
  const maxNum = maxPrice.trim() === '' ? undefined : Number.parseFloat(maxPrice);

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        categoryId,
        search: deferredSearch.trim(),
        sortBy,
        minPrice: minNum,
        maxPrice: maxNum,
      }),
    [categoryId, deferredSearch, sortBy, minNum, maxNum],
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

  const { data: categories } = useCategoriesFlatQuery();

  const categorySelectOptions = useMemo(
    () => [
      { value: '', label: 'Todas las categorías' },
      ...(categories ?? []).map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories],
  );

  const filters = useMemo(
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
    [page, categoryId, deferredSearch, sortBy, minNum, maxNum],
  );

  const {
    data,
    isPending,
    isError,
    isFetching,
    isPlaceholderData,
  } = useProductsListQuery(filters);

  const accumulated = useAccumulatedProductList(page, data, isPlaceholderData);

  const totalPages = data?.totalPages ?? 0;
  const canLoadMore = page < totalPages;

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

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:pt-8">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            {marketingCopy.catalogTitle}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {marketingCopy.catalogSubtitle}
          </p>
        </div>
      </header>

      <div className="relative mb-5 flex min-h-[52px] items-stretch gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
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
            aria-controls="catalog-filter-popover"
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
              id="catalog-filter-popover"
              role="dialog"
              aria-label="Filtros y orden"
              className="catalog-filter-popover absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(calc(100vw-2rem),20rem)] rounded-xl border border-zinc-200/90 bg-white p-4 shadow-[0_16px_48px_-12px_rgb(0_0_0/0.18)] ring-1 ring-zinc-200/70 dark:border-night-600 dark:bg-night-900 dark:shadow-[0_20px_56px_-12px_rgb(0_0_0/0.55)] dark:ring-night-700/80"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-medium text-zinc-600 dark:text-zinc-300"
                    htmlFor={catalogCategoryFieldId}
                  >
                    Categoría
                  </label>
                  <FormSelect
                    id={catalogCategoryFieldId}
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
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-medium text-zinc-600 dark:text-zinc-300"
                    htmlFor={catalogSortFieldId}
                  >
                    Orden
                  </label>
                  <FormSelect
                    id={catalogSortFieldId}
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
          <p className="py-16 text-center text-sm text-zinc-500">Cargando…</p>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-red-600">
            No se pudieron cargar los productos.
          </p>
        ) : !accumulated.length &&
          !(isFetching && page === 1 && !isPending) ? (
          <p className="py-16 text-center text-sm text-zinc-500">
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
