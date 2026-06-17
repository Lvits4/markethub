import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiHeart } from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { ProductImage } from '../../components/ProductImage/ProductImage';
import { QuantitySelector } from '../../components/QuantitySelector/QuantitySelector';
import { routePaths } from '../../config/routes';
import { formatPrice } from '../../helpers/formatPrice/formatPrice';
import { getErrorMessage } from '../../helpers/mapApiError/mapApiError';
import {
  getPrimaryImageUrl,
  getSortedProductImages,
} from '../../helpers/productImageUrl/productImageUrl';
import { publicStorageImageSrc } from '../../helpers/storagePublicUrl/storagePublicUrl';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { useCartMutations } from '../../hooks/useCartMutations/useCartMutations';
import { useFavoriteToggle } from '../../hooks/useFavoriteToggle/useFavoriteToggle';
import { useProductByIdQuery } from '../../queries/useProductByIdQuery/useProductByIdQuery';
import { useFavoriteCheckQuery } from '../../queries/useFavoriteCheckQuery/useFavoriteCheckQuery';
import { addToCartSchema } from '../../validations/addToCartSchema';

function toPriceNumber(price: string | number): number {
  const n = typeof price === 'string' ? Number.parseFloat(price) : price;
  return Number.isNaN(n) ? 0 : n;
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProductByIdQuery(id);
  const { isAuthenticated } = useAuth();
  const { data: isFav } = useFavoriteCheckQuery(id, isAuthenticated);
  const { add: addFav, remove: removeFav } = useFavoriteToggle(id);
  const { addItem } = useCartMutations();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setActiveImage(0);
    setQty(1);
  }, [id]);

  const images = useMemo(
    () => (product ? getSortedProductImages(product) : []),
    [product],
  );

  const mainImageUrl = useMemo(() => {
    const raw = images[activeImage]?.url;
    if (raw) {
      const src = publicStorageImageSrc(raw);
      return src || null;
    }
    return product ? getPrimaryImageUrl(product) : null;
  }, [images, activeImage, product]);

  const maxQty = product?.stock ?? 0;
  const unitPrice = product ? toPriceNumber(product.price) : 0;
  const lineTotal = unitPrice * qty;

  const addToCart = async () => {
    if (!product || !id) return;
    if (!isAuthenticated) {
      toast.error('Inicia sesión para comprar');
      navigate(routePaths.login);
      return false;
    }
    const parsed = addToCartSchema.safeParse({ productId: id, quantity: qty });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Datos inválidos');
      return false;
    }
    try {
      await addItem.mutateAsync(parsed.data);
      toast.success('Añadido al carrito');
      return true;
    } catch (e) {
      toast.error(getErrorMessage(e));
      return false;
    }
  };

  const handleBuy = () => void addToCart();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(routePaths.browse);
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
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-zinc-500">
        Cargando producto…
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-red-600">
        No se encontró el producto.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 sm:pb-10 sm:pt-6 lg:pb-12">
      <nav
        className="mb-4 flex flex-wrap items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm"
        aria-label="Migas de pan"
      >
        <Link to={routePaths.browse} className="hover:text-forest dark:hover:text-forest-muted">
          Inicio
        </Link>
        <span aria-hidden>/</span>
        <Link
          to={routePaths.browse}
          className="hover:text-forest dark:hover:text-forest-muted"
        >
          Catálogo
        </Link>
        <span aria-hidden>/</span>
        <span className="line-clamp-1 font-medium text-zinc-800 dark:text-zinc-200">
          {product.name}
        </span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_min(100%,420px)] lg:items-start lg:gap-10">
        <div>
          <div className="relative aspect-[4/4.8] w-full overflow-hidden rounded-md bg-zinc-100 shadow-market ring-1 ring-zinc-200/60 dark:bg-night-800 dark:shadow-market-dark dark:ring-night-700/50 sm:aspect-[4/5.1] lg:aspect-[4/4.55] lg:max-h-[430px]">
            <button
              type="button"
              onClick={goBack}
              className="absolute left-3 top-3 z-10 cursor-pointer rounded-md bg-white/95 p-2.5 text-zinc-900 shadow-sm backdrop-blur-sm dark:bg-night-900/95 dark:text-zinc-100"
              aria-label="Volver a la vista anterior"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => void handleFavorite()}
              className="absolute right-3 top-3 z-10 cursor-pointer rounded-md bg-white/95 p-2.5 text-zinc-900 shadow-sm backdrop-blur-sm dark:bg-night-900/95 dark:text-zinc-100"
              aria-label="Favorito"
            >
              <FiHeart
                className={`h-5 w-5 ${isFav ? 'fill-forest text-forest' : ''}`}
              />
            </button>
            <ProductImage
              src={mainImageUrl}
              alt={product.name}
              showFallbackLabel={false}
            />
          </div>

          {images.length > 1 ? (
            <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-md ring-2 transition sm:h-20 sm:w-20 ${
                    i === activeImage
                      ? 'ring-forest'
                      : 'ring-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <ProductImage
                    src={publicStorageImageSrc(img.url)}
                    alt={img.altText ?? product.name}
                    showFallbackLabel={false}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-21">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              {product.name}
            </h1>
            {product.description ? (
              <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {product.description}
              </p>
            ) : null}
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              {maxQty === 0 ? (
                <span className="font-medium text-amber-700 dark:text-amber-400">
                  Sin stock disponible
                </span>
              ) : (
                <>
                  <span className="font-semibold text-forest">En stock</span>
                  {` · ${maxQty} unidades`}
                </>
              )}
            </p>
            <p className="mt-6 text-3xl font-bold text-forest">
              {formatPrice(product.price)}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Cantidad
                </span>
                <div className="mt-2">
                  <QuantitySelector
                    value={qty}
                    min={1}
                    max={maxQty}
                    onChange={setQty}
                    disabled={maxQty === 0}
                  />
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Subtotal
                </span>
                <p className="mt-2 text-2xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                  {formatPrice(lineTotal)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <Button
                type="button"
                variant="primary"
                className="w-full justify-center py-3.5 text-base"
                disabled={maxQty === 0 || addItem.isPending}
                onClick={handleBuy}
              >
                Añadir al carrito
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
