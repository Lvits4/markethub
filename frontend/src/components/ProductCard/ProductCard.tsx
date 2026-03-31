import { FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { routePaths } from '../../config/routes';
import { formatPrice } from '../../helpers/formatPrice';
import { getPrimaryImageUrl } from '../../helpers/productImageUrl';
import type { Product } from '../../types/product';
import { Badge } from '../Badge/Badge';

type ProductCardProps = {
  product: Product;
  badgeLabel?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  favoriteDisabled?: boolean;
};

export function ProductCard({
  product,
  badgeLabel,
  isFavorite,
  onToggleFavorite,
  favoriteDisabled,
}: ProductCardProps) {
  const img = getPrimaryImageUrl(product);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-market)] ring-1 ring-zinc-200/60 transition hover:shadow-md dark:bg-zinc-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-zinc-800">
      <Link
        to={routePaths.productDetail(product.id)}
        className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800"
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
          className="absolute right-3 top-3 cursor-pointer rounded-xl bg-white/90 p-2 text-zinc-900 shadow-sm backdrop-blur-sm transition hover:bg-white disabled:cursor-not-allowed dark:bg-zinc-900/90 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <FiHeart
            className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
          />
        </button>
      ) : null}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <Link
          to={routePaths.productDetail(product.id)}
          className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-50"
        >
          {product.name}
        </Link>
        <p className="text-sm font-medium text-[var(--color-forest)] dark:text-emerald-400">
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  );
}
