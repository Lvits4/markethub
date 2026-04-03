import type { MouseEvent } from 'react';
import { FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { routePaths } from '../../config/routes';
import { formatPrice } from '../../helpers/formatPrice';
import { getPrimaryImageUrl } from '../../helpers/productImageUrl';
import type { Product } from '../../types/product';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';

type ProductCardProps = {
  product: Product;
  badgeLabel?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  favoriteDisabled?: boolean;
  onAddToCart?: (e: MouseEvent<HTMLButtonElement>) => void;
  addToCartDisabled?: boolean;
};

export function ProductCard({
  product,
  badgeLabel,
  isFavorite,
  onToggleFavorite,
  favoriteDisabled,
  onAddToCart,
  addToCartDisabled,
}: ProductCardProps) {
  const img = getPrimaryImageUrl(product);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-md bg-white shadow-[var(--shadow-market)] ring-1 ring-zinc-200/60 transition hover:shadow-md dark:bg-night-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-night-800">
      <Link
        to={routePaths.productDetail(product.id)}
        className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-night-800"
      >
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
            Sin imagen
          </div>
        )}
        {badgeLabel ? <Badge label={badgeLabel} /> : null}
      </Link>
      {onToggleFavorite ? (
        <button
          type="button"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          disabled={favoriteDisabled}
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite();
          }}
          className="absolute right-2 top-2 cursor-pointer rounded-full bg-transparent p-1 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiHeart
            className={`h-7 w-7 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] ${isFavorite ? 'fill-[var(--color-forest)] text-[var(--color-forest)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : ''}`}
          />
        </button>
      ) : null}
      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <Link
          to={routePaths.productDetail(product.id)}
          className="line-clamp-2 text-sm font-semibold leading-tight text-zinc-900 dark:text-zinc-50"
        >
          {product.name}
        </Link>
        <p className="text-sm font-medium text-[var(--color-forest)]">
          {formatPrice(product.price)}
        </p>
        {onAddToCart ? (
          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full justify-center py-1.5 text-xs"
            disabled={addToCartDisabled}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(e);
            }}
          >
            Añadir al carrito
          </Button>
        ) : null}
      </div>
    </article>
  );
}
