import { useMemo } from 'react';
import { useFavoritesQuery } from '../../queries/useFavoritesQuery';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { useAuth } from '../../hooks/useAuth';
import { useFavoriteToggle } from '../../hooks/useFavoriteToggle';
import { useFavoriteCheckQuery } from '../../queries/useFavoriteCheckQuery';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../helpers/mapApiError';
import type { Product } from '../../types/product';

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

  const products = useMemo(() => {
    if (!data?.length) return [];
    return data
      .map((f) => f.product)
      .filter((p): p is Product => p != null);
  }, [data]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:pb-10 sm:pt-8 lg:pb-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
        Favoritos
      </h1>
      {isLoading ? (
        <p className="mt-10 text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="mt-10 text-center text-sm text-red-600">
          No se pudieron cargar los favoritos.
        </p>
      ) : !products.length ? (
        <p className="mt-10 text-center text-sm text-zinc-500">
          Aún no guardas favoritos.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <li key={p.id}>
              <FavoriteRowCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
