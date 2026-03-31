import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiHeart } from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { QuantitySelector } from '../../components/QuantitySelector/QuantitySelector';
import { routePaths } from '../../config/routes';
import { formatPrice } from '../../helpers/formatPrice';
import { getErrorMessage } from '../../helpers/mapApiError';
import { getPrimaryImageUrl } from '../../helpers/productImageUrl';
import { useAuth } from '../../hooks/useAuth';
import { useCartMutations } from '../../hooks/useCartMutations';
import { useFavoriteToggle } from '../../hooks/useFavoriteToggle';
import { useProductByIdQuery } from '../../queries/useProductByIdQuery';
import { useFavoriteCheckQuery } from '../../queries/useFavoriteCheckQuery';
import { addToCartSchema } from '../../validations/addToCartSchema';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProductByIdQuery(id);
  const { isAuthenticated } = useAuth();
  const { data: isFav } = useFavoriteCheckQuery(id, isAuthenticated);
  const { add: addFav, remove: removeFav } = useFavoriteToggle(id);
  const { addItem } = useCartMutations();
  const [qty, setQty] = useState(1);

  const imageUrl = useMemo(
    () => (product ? getPrimaryImageUrl(product) : null),
    [product],
  );

  const maxQty = product?.stock ?? 0;

  const handleBuy = async () => {
    if (!product || !id) return;
    if (!isAuthenticated) {
      toast.error('Inicia sesión para comprar');
      navigate(routePaths.login);
      return;
    }
    const parsed = addToCartSchema.safeParse({ productId: id, quantity: qty });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Datos inválidos');
      return;
    }
    try {
      await addItem.mutateAsync(parsed.data);
      toast.success('Añadido al carrito');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para favoritos');
      return;
    }
    try {
      if (isFav) {
        await removeFav.mutateAsync();
        toast.success('Quitado de favoritos');
      } else {
        await addFav.mutateAsync();
        toast.success('En favoritos');
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-16 text-center text-sm text-zinc-500">
        Cargando producto…
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="px-4 py-16 text-center text-sm text-red-600">
        No se encontró el producto.
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-lg pb-28">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Link
          to={routePaths.catalog}
          className="absolute left-4 top-4 z-10 rounded-md bg-white/90 p-2.5 text-zinc-900 shadow-sm backdrop-blur-sm dark:bg-zinc-900/90 dark:text-zinc-100"
          aria-label="Volver al catálogo"
        >
          <FiArrowLeft className="h-5 w-5" />
        </Link>
        <button
          type="button"
          onClick={() => void handleFavorite()}
          className="absolute right-4 top-4 z-10 cursor-pointer rounded-md bg-white/90 p-2.5 text-zinc-900 shadow-sm backdrop-blur-sm dark:bg-zinc-900/90 dark:text-zinc-100"
          aria-label="Favorito"
        >
          <FiHeart
            className={`h-5 w-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`}
          />
        </button>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="relative -mt-8 rounded-t-md bg-white px-5 pb-8 pt-6 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:bg-zinc-900 dark:shadow-none dark:ring-1 dark:ring-zinc-800">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {product.name}
        </h1>
        {product.description ? (
          <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {product.description}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xl font-semibold text-[var(--color-forest)] dark:text-emerald-400">
            {formatPrice(product.price)}
          </p>
          <QuantitySelector
            value={qty}
            min={1}
            max={maxQty}
            onChange={setQty}
            disabled={maxQty === 0}
          />
        </div>
        {maxQty === 0 ? (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            Sin stock disponible.
          </p>
        ) : null}

        <Button
          type="button"
          variant="primary"
          className="mt-8 w-full justify-center rounded-md py-4 text-base"
          disabled={maxQty === 0 || addItem.isPending}
          onClick={() => void handleBuy()}
        >
          Añadir al carrito —{' '}
          {formatPrice(
            (typeof product.price === 'string'
              ? Number.parseFloat(product.price)
              : product.price) * qty,
          )}
        </Button>
      </div>
    </div>
  );
}
