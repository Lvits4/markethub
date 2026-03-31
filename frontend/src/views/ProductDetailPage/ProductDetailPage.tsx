import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiArrowLeft,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiStar,
} from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { QuantitySelector } from '../../components/QuantitySelector/QuantitySelector';
import { routePaths } from '../../config/routes';
import { formatPrice } from '../../helpers/formatPrice';
import { getErrorMessage } from '../../helpers/mapApiError';
import {
  getPrimaryImageUrl,
  getSortedProductImages,
} from '../../helpers/productImageUrl';
import { useAuth } from '../../hooks/useAuth';
import { useCartMutations } from '../../hooks/useCartMutations';
import { useFavoriteToggle } from '../../hooks/useFavoriteToggle';
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
} from '../../hooks/useReviewMutations';
import { useProductByIdQuery } from '../../queries/useProductByIdQuery';
import { useReviewsByProductQuery } from '../../queries/useReviewsByProductQuery';
import { useFavoriteCheckQuery } from '../../queries/useFavoriteCheckQuery';
import { addToCartSchema } from '../../validations/addToCartSchema';

function toPriceNumber(price: string | number): number {
  const n = typeof price === 'string' ? Number.parseFloat(price) : price;
  return Number.isNaN(n) ? 0 : n;
}

function RatingRow({
  averageRating,
  totalReviews,
}: {
  averageRating: string | number;
  totalReviews: number;
}) {
  const avg = toPriceNumber(averageRating);
  const full = Math.min(5, Math.max(0, Math.round(avg)));
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="flex items-center gap-0.5" aria-label={`Valoración ${avg} de 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <FiStar
            key={i}
            className={`h-4 w-4 ${
              i < full
                ? 'fill-[var(--color-accent-warm)] text-[var(--color-accent-warm)]'
                : 'text-zinc-300 dark:text-zinc-600'
            }`}
          />
        ))}
      </span>
      <span className="text-zinc-500 dark:text-zinc-400">
        {avg > 0 ? avg.toFixed(1) : 'Sin valorar'}
        {totalReviews > 0 ? ` · ${totalReviews} opiniones` : null}
      </span>
    </div>
  );
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
    if (images[activeImage]?.url) return images[activeImage].url;
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

  const handleBuyNow = async () => {
    const ok = await addToCart();
    if (ok) navigate(routePaths.cart);
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

  const handleShare = async () => {
    if (!product) return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Enlace copiado al portapapeles');
      }
    } catch {
      /* usuario canceló o fallo clipboard */
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
        <Link to={routePaths.catalog} className="hover:text-[var(--color-forest)] dark:hover:text-emerald-400">
          Inicio
        </Link>
        <span aria-hidden>/</span>
        <Link
          to={routePaths.catalog}
          className="hover:text-[var(--color-forest)] dark:hover:text-emerald-400"
        >
          Catálogo
        </Link>
        <span aria-hidden>/</span>
        <span className="line-clamp-1 font-medium text-zinc-800 dark:text-zinc-200">
          {product.name}
        </span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,380px)] lg:items-start lg:gap-10">
        <div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-zinc-100 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/60 dark:bg-zinc-800 dark:shadow-[var(--shadow-market-dark)] dark:ring-zinc-700/50 sm:aspect-[5/6] lg:aspect-square">
            <Link
              to={routePaths.catalog}
              className="absolute left-3 top-3 z-10 rounded-xl bg-white/95 p-2.5 text-zinc-900 shadow-sm backdrop-blur-sm dark:bg-zinc-900/95 dark:text-zinc-100"
              aria-label="Volver al catálogo"
            >
              <FiArrowLeft className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={() => void handleFavorite()}
              className="absolute right-3 top-3 z-10 cursor-pointer rounded-xl bg-white/95 p-2.5 text-zinc-900 shadow-sm backdrop-blur-sm dark:bg-zinc-900/95 dark:text-zinc-100"
              aria-label="Favorito"
            >
              <FiHeart
                className={`h-5 w-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`}
              />
            </button>
            {mainImageUrl ? (
              <img
                src={mainImageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">
                Sin imagen
              </div>
            )}
          </div>

          {images.length > 1 ? (
            <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-2 transition sm:h-20 sm:w-20 ${
                    i === activeImage
                      ? 'ring-[var(--color-forest)] dark:ring-emerald-500'
                      : 'ring-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.altText ?? product.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-[5.25rem]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-3">
              <RatingRow
                averageRating={product.averageRating}
                totalReviews={product.totalReviews}
              />
            </div>
            {product.description ? (
              <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {product.description}
              </p>
            ) : null}
            <p className="mt-6 text-3xl font-bold text-[var(--color-forest)] dark:text-emerald-400">
              {formatPrice(product.price)}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-zinc-800">
            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Entrega
            </label>
            <div className="mt-2 flex cursor-default items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100">
              España (península)
            </div>

            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              {maxQty === 0 ? (
                <span className="font-medium text-amber-700 dark:text-amber-400">
                  Sin stock disponible
                </span>
              ) : (
                <>
                  <span className="font-semibold text-[var(--color-forest)] dark:text-emerald-400">
                    En stock
                  </span>
                  {` · ${maxQty} unidades`}
                </>
              )}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Cantidad
              </span>
              <QuantitySelector
                value={qty}
                min={1}
                max={maxQty}
                onChange={setQty}
                disabled={maxQty === 0}
              />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-5 dark:border-zinc-800">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Subtotal
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {formatPrice(lineTotal)}
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <Button
                type="button"
                variant="primary"
                className="w-full justify-center py-3.5 text-base"
                disabled={maxQty === 0 || addItem.isPending}
                onClick={handleBuy}
              >
                Añadir al carrito
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center py-3.5 text-base"
                disabled={maxQty === 0 || addItem.isPending}
                onClick={() => void handleBuyNow()}
              >
                Comprar ahora
              </Button>
            </div>

            <div className="mt-4 flex justify-center gap-2">
              <Button
                type="button"
                variant="ghost"
                className="gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                onClick={() => void handleShare()}
              >
                <FiShare2 className="h-4 w-4" />
                Compartir
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                onClick={() =>
                  toast('Pronto podrás chatear con la tienda', { icon: '💬' })
                }
              >
                <FiMessageCircle className="h-4 w-4" />
                Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {id ? (
        <ProductReviewsSection productId={id} />
      ) : null}
    </div>
  );
}

function ProductReviewsSection({ productId }: { productId: string }) {
  const { user, isAuthenticated } = useAuth();
  const { data: reviews, isLoading } = useReviewsByProductQuery(productId);
  const createMut = useCreateReviewMutation(productId);
  const updateMut = useUpdateReviewMutation(productId);
  const deleteMut = useDeleteReviewMutation(productId);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  const myReview = reviews?.find((r) => r.userId === user?.id);

  const submitNew = () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para opinar');
      return;
    }
    createMut.mutate(
      { rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Reseña publicada');
          setComment('');
          setRating(5);
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  return (
    <section className="mt-14 border-t border-zinc-200 pt-10 dark:border-zinc-800">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
        Opiniones
      </h2>

      {isAuthenticated && !myReview ? (
        <div className="mt-4 rounded-3xl bg-white p-5 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Valora este producto
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="text-xs text-zinc-500">Puntuación</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} estrellas
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Comentario (opcional)"
            className="mt-3 w-full rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <Button
            type="button"
            variant="primary"
            className="mt-3"
            disabled={createMut.isPending}
            onClick={submitNew}
          >
            Publicar reseña
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <p className="mt-6 text-sm text-zinc-500">Cargando opiniones…</p>
      ) : !reviews?.length ? (
        <p className="mt-6 text-sm text-zinc-500">Aún no hay opiniones.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-zinc-100 bg-white/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/80"
            >
              {editingId === r.id ? (
                <div className="space-y-2">
                  <select
                    value={editRating}
                    onChange={(e) => setEditRating(Number(e.target.value))}
                    className="rounded-lg border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      className="text-xs"
                      disabled={updateMut.isPending}
                      onClick={() =>
                        updateMut.mutate(
                          {
                            id: r.id,
                            body: {
                              rating: editRating,
                              comment: editComment.trim() || undefined,
                            },
                          },
                          {
                            onSuccess: () => {
                              toast.success('Reseña actualizada');
                              setEditingId(null);
                            },
                            onError: (e) => toast.error(getErrorMessage(e)),
                          },
                        )
                      }
                    >
                      Guardar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {r.user
                        ? `${r.user.firstName} ${r.user.lastName}`
                        : 'Usuario'}
                    </p>
                    <span className="text-sm text-amber-600 dark:text-amber-400">
                      {r.rating}/5
                    </span>
                  </div>
                  {r.comment ? (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {r.comment}
                    </p>
                  ) : null}
                  {user?.id === r.userId ? (
                    <div className="mt-2 flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-xs"
                        onClick={() => {
                          setEditingId(r.id);
                          setEditRating(r.rating);
                          setEditComment(r.comment ?? '');
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-xs text-red-600"
                        disabled={deleteMut.isPending}
                        onClick={() =>
                          deleteMut.mutate(r.id, {
                            onSuccess: () => toast.success('Reseña eliminada'),
                            onError: (e) => toast.error(getErrorMessage(e)),
                          })
                        }
                      >
                        Eliminar
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
