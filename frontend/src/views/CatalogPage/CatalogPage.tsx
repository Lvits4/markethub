import { useDeferredValue, useMemo, useState } from 'react';
import { FiBell } from 'react-icons/fi';
import { useCategoriesFlatQuery } from '../../queries/useCategoriesFlatQuery';
import { useProductsListQuery } from '../../queries/useProductsListQuery';
import { CategoryPill } from '../../components/CategoryPill/CategoryPill';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import { marketingCopy } from '../../data/marketingCopy';
import { useAuth } from '../../hooks/useAuth';
import { useFavoriteCheckQuery } from '../../queries/useFavoriteCheckQuery';
import { useFavoriteToggle } from '../../hooks/useFavoriteToggle';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../helpers/mapApiError';
import type { Product } from '../../types/product';

function CatalogProductCard({ item }: { item: Product }) {
  const { isAuthenticated } = useAuth();
  const { data: isFav } = useFavoriteCheckQuery(item.id, isAuthenticated);
  const { add, remove } = useFavoriteToggle(item.id);

  const handleFav = async () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para usar favoritos');
      return;
    }
    try {
      if (isFav) {
        await remove.mutateAsync();
        toast.success('Quitado de favoritos');
      } else {
        await add.mutateAsync();
        toast.success('Guardado en favoritos');
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <ProductCard
      product={item}
      isFavorite={Boolean(isFav)}
      onToggleFavorite={handleFav}
      favoriteDisabled={add.isPending || remove.isPending}
    />
  );
}

export function CatalogPage() {
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const { data: categories } = useCategoriesFlatQuery();

  const filters = useMemo(
    () => ({
      page: 1,
      limit: 12,
      search: deferredSearch.trim() || undefined,
      categoryId,
    }),
    [categoryId, deferredSearch],
  );

  const { data, isLoading, isError } = useProductsListQuery(filters);

  return (
    <div className="mx-auto max-w-lg px-4 pt-10">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {marketingCopy.catalogTitle}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {marketingCopy.catalogSubtitle}
          </p>
        </div>
        <button
          type="button"
          className="rounded-full bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
          aria-label="Notificaciones"
        >
          <FiBell className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
        </button>
      </header>

      <SearchInput value={search} onChange={setSearch} className="mb-5" />

      <div className="no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
        <CategoryPill
          label="Todo"
          active={!categoryId}
          onClick={() => setCategoryId(undefined)}
        />
        {(categories ?? []).map((c) => (
          <CategoryPill
            key={c.id}
            label={c.name}
            active={categoryId === c.id}
            onClick={() =>
              setCategoryId((prev) => (prev === c.id ? undefined : c.id))
            }
          />
        ))}
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="py-16 text-center text-sm text-red-600">
          No se pudieron cargar los productos.
        </p>
      ) : !data?.data.length ? (
        <p className="py-16 text-center text-sm text-zinc-500">
          No hay productos con estos filtros.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 pb-4">
          {data.data.map((item) => (
            <li key={item.id}>
              <CatalogProductCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
