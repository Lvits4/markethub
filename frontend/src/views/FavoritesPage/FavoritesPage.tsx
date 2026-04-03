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
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import { useAuth } from '../../hooks/useAuth';
import { useFavoriteToggle } from '../../hooks/useFavoriteToggle';
import { useFavoriteCheckQuery } from '../../queries/useFavoriteCheckQuery';
import { useFavoritesQuery } from '../../queries/useFavoritesQuery';
import { useCategoriesFlatQuery } from '../../queries/useCategoriesFlatQuery';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../helpers/mapApiError';
import type { Product, ProductSortBy } from '../../types/product';

const SORT_OPTIONS: { value: ProductSortBy; label: string }[] = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor' },
  { value: 'price_desc', label: 'Precio: mayor' },
  { value: 'best_selling', label: 'Más vendidos' },
];

const DEFAULT_SORT: ProductSortBy = 'newest';

const filterFieldClass =
  'page-size-input w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/25 dark:border-night-600 dark:bg-night-800/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[var(--color-market-dark-accent)] dark:focus:ring-[color:rgb(69_139_222/0.22)]';

function productPrice(p: Product): number {
  const v = p.price;
  return typeof v === 'string' ? Number.parseFloat(v) : v;
}

function FavoriteRowCard({ product }: { product: Product }) {
  const { isAuthenticated } = useAuth();
  const { data: isFav } = useFavoriteCheckQuery(product.id, isAuthenticated);
  const { remove } = useFavoriteToggle(product.id);

  const handleFav = async () => {
    try {
      await remove.mutateAsync();
      toast.success('Quitado de favoritos');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <ProductCard
      product={product}
      isFavorite={Boolean(isFav)}
      onToggleFavorite={handleFav}
      favoriteDisabled={remove.isPending}
    />
  );
}

export function FavoritesPage() {
  const { data, isLoading, isError } = useFavoritesQuery();
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
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const filterPopoverRef = useRef<HTMLDivElement>(null);
  const favoritesSortFieldId = useId();
  const favoritesCategoryFieldId = useId();

  const minNum = minPrice.trim() === '' ? undefined : Number.parseFloat(minPrice);
  const maxNum = maxPrice.trim() === '' ? undefined : Number.parseFloat(maxPrice);

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

  const baseProducts = useMemo(() => {
    if (!data?.length) return [];
    return data
      .map((f) => f.product)
      .filter((p): p is Product => p != null);
  }, [data]);

  const filteredProducts = useMemo(() => {
    if (!data?.length) return [];
    const q = deferredSearch.trim().toLowerCase();
    const minOk =
      minNum !== undefined && !Number.isNaN(minNum) && minNum >= 0
        ? minNum
        : undefined;
    const maxOk =
      maxNum !== undefined && !Number.isNaN(maxNum) && maxNum >= 0
        ? maxNum
        : undefined;

    const ordered = data
      .map((f) => f.product)
      .filter((p): p is Product => p != null)
      .filter((p) => {
        if (q) {
          const name = p.name.toLowerCase();
          const desc = (p.description ?? '').toLowerCase();
          if (!name.includes(q) && !desc.includes(q)) return false;
        }
        if (categoryId && p.categoryId !== categoryId) return false;
        const price = productPrice(p);
        if (Number.isNaN(price)) return false;
        if (minOk !== undefined && price < minOk) return false;
        if (maxOk !== undefined && price > maxOk) return false;
        return true;
      });

    if (sortBy === 'price_asc') {
      return [...ordered].sort((a, b) => productPrice(a) - productPrice(b));
    }
    if (sortBy === 'price_desc') {
      return [...ordered].sort((a, b) => productPrice(b) - productPrice(a));
    }
    return ordered;
  }, [data, deferredSearch, categoryId, sortBy, minNum, maxNum]);

  const handleClearFilters = () => {
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
    setCategoryId(draftCategoryId === '' ? undefined : draftCategoryId);
    setSortBy(draftSortBy);
    setMinPrice(draftMinPrice);
    setMaxPrice(draftMaxPrice);
    setFilterPopoverOpen(false);
  };

  const showToolbar = !isLoading && !isError && baseProducts.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:pb-10 sm:pt-8 lg:pb-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
        Favoritos
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Productos que guardaste para volver a verlos o comprarlos después.
      </p>

      {showToolbar ? (
        <div className="relative mt-6 flex min-h-[52px] items-stretch gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar en favoritos…"
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
              aria-controls="favorites-filter-popover"
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
                id="favorites-filter-popover"
                role="dialog"
                aria-label="Filtros y orden"
                className="catalog-filter-popover absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(calc(100vw-2rem),20rem)] rounded-xl border border-zinc-200/90 bg-white p-4 shadow-[0_16px_48px_-12px_rgb(0_0_0/0.18)] ring-1 ring-zinc-200/70 dark:border-night-600 dark:bg-night-900 dark:shadow-[0_20px_56px_-12px_rgb(0_0_0/0.55)] dark:ring-night-700/80"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-medium text-zinc-600 dark:text-zinc-300"
                      htmlFor={favoritesCategoryFieldId}
                    >
                      Categoría
                    </label>
                    <FormSelect
                      id={favoritesCategoryFieldId}
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
                      htmlFor={favoritesSortFieldId}
                    >
                      Orden
                    </label>
                    <FormSelect
                      id={favoritesSortFieldId}
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
      ) : null}

      {isLoading ? (
        <p className="mt-10 text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="mt-10 text-center text-sm text-red-600">
          No se pudieron cargar los favoritos.
        </p>
      ) : !baseProducts.length ? (
        <p className="mt-10 text-center text-sm text-zinc-500">
          Aún no guardas favoritos.
        </p>
      ) : !filteredProducts.length ? (
        <p className="mt-10 text-center text-sm text-zinc-500">
          No hay favoritos con estos filtros.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p) => (
            <li key={p.id}>
              <FavoriteRowCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
