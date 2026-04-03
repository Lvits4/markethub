import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiChevronDown,
  FiImage,
  FiMessageCircle,
  FiPackage,
  FiTag,
  FiTrash2,
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { Modal } from '../../components/Modal/Modal';
import { QuantitySelector } from '../../components/QuantitySelector/QuantitySelector';
import { routePaths } from '../../config/routes';
import { formatPrice } from '../../helpers/formatPrice';
import { getErrorMessage } from '../../helpers/mapApiError';
import { getPrimaryImageUrl } from '../../helpers/productImageUrl';
import { useAuth } from '../../hooks/useAuth';
import { useCartMutations } from '../../hooks/useCartMutations';
import { useCreateOrderMutation } from '../../hooks/useCreateOrderMutation';
import { useCartQuery } from '../../queries/useCartQuery';
import { updateCartItemSchema } from '../../validations/updateCartItemSchema';

function unitPriceNumber(price: string | number | undefined): number {
  const n = typeof price === 'string' ? Number.parseFloat(price) : Number(price ?? 0);
  return Number.isNaN(n) ? 0 : n;
}

const checkoutFieldClass =
  'w-full rounded-lg border border-zinc-200/90 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/15 dark:border-night-600 dark:bg-night-900/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[var(--color-market-dark-accent)] dark:focus:ring-[var(--color-market-dark-accent)]/20';

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading, isError } = useCartQuery();
  const { updateItem, removeItem } = useCartMutations();
  const createOrder = useCreateOrderMutation();
  const [coupon, setCoupon] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [couponOpen, setCouponOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const items = cart?.items ?? [];

  const handleQty = async (itemId: string, quantity: number) => {
    const parsed = updateCartItemSchema.safeParse({ quantity });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Cantidad inválida');
      return;
    }
    try {
      await updateItem.mutateAsync({ itemId, body: parsed.data });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeItem.mutateAsync(itemId);
      toast.success('Eliminado del carrito');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const subtotal = items.reduce(
    (acc, it) => acc + unitPriceNumber(it.product?.price) * it.quantity,
    0,
  );

  const shipping = 0;
  const total = subtotal + shipping;

  const openCheckoutModal = () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para crear el pedido');
      navigate(routePaths.login);
      return;
    }
    setCheckoutModalOpen(true);
  };

  const handleCheckout = () => {
    const addr = shippingAddress.trim();
    if (!addr) {
      toast.error('Indica la dirección de envío');
      return;
    }
    const note = orderNote.trim();
    const fullAddress =
      note.length > 0 ? `${addr}\n\nNota: ${note}` : addr;
    createOrder.mutate(fullAddress, {
      onSuccess: (orders) => {
        setCheckoutModalOpen(false);
        toast.success('Pedido confirmado');
        const first = orders[0];
        if (first?.id) {
          navigate(routePaths.orderDetail(first.id));
        } else {
          navigate(routePaths.orders);
        }
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  const showCheckoutCta =
    !isLoading && !isError && items.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:pb-10 sm:pt-8 lg:pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Carrito
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Revisa cantidades y confirma tu pedido cuando estés listo.
          </p>
        </div>
        {showCheckoutCta ? (
          <Button
            type="button"
            variant="primary"
            className="shrink-0 justify-center px-5 py-2.5 text-sm font-semibold sm:py-3 sm:text-base"
            onClick={openCheckoutModal}
          >
            Crear pedido
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <p className="mt-10 text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="mt-10 text-center text-sm text-red-600">
          No se pudo cargar el carrito.
        </p>
      ) : !items.length ? (
        <p className="mt-10 text-center text-sm text-zinc-500">
          Tu carrito está vacío.{' '}
          <Link
            to={routePaths.catalog}
            className="font-semibold text-[var(--color-forest)]"
          >
            Ir al catálogo
          </Link>
        </p>
      ) : (
        <>
          <ul className="mt-8 space-y-4">
            {items.map((it) => {
              const product = it.product;
              const img = product ? getPrimaryImageUrl(product) : null;
              return (
                <li
                  key={it.id}
                  className="flex gap-4 rounded-md bg-white p-4 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-night-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-night-800 sm:p-5"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-night-800 sm:h-28 sm:w-28">
                    {img ? (
                      <img
                        src={img}
                        alt={product?.name ?? ''}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full flex-col items-center justify-center gap-1 px-1 text-center text-[10px] font-medium text-zinc-400 dark:text-zinc-500"
                        aria-hidden
                      >
                        <FiImage className="h-7 w-7 opacity-70" />
                        <span className="leading-tight">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Link
                      to={
                        product
                          ? routePaths.productDetail(product.id)
                          : routePaths.catalog
                      }
                      className="line-clamp-2 font-semibold text-zinc-900 dark:text-zinc-50"
                    >
                      {product?.name ?? 'Producto'}
                    </Link>
                    {product ? (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium text-[var(--color-forest)] dark:text-[var(--color-market-dark-accent)]">
                          {formatPrice(product.price)}
                        </span>
                        <span className="mx-1">×</span>
                        <span className="tabular-nums">{it.quantity}</span>
                        <span className="mx-1">=</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatPrice(
                            unitPriceNumber(product.price) * it.quantity,
                          )}
                        </span>
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <QuantitySelector
                        value={it.quantity}
                        min={1}
                        max={product?.stock}
                        onChange={(n) => void handleQty(it.id, n)}
                        disabled={updateItem.isPending}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="shrink-0 gap-1.5 border-red-300 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-800/80 dark:text-red-400 dark:hover:bg-red-950/40"
                        onClick={() => void handleRemove(it.id)}
                        disabled={removeItem.isPending}
                        aria-label="Quitar del carrito"
                      >
                        <FiTrash2 className="h-4 w-4 shrink-0" aria-hidden />
                        Quitar
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <Modal
            open={checkoutModalOpen}
            onClose={() => {
              if (createOrder.isPending) return;
              setCheckoutModalOpen(false);
            }}
            title="Crear pedido"
            contentWrapperClassName="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          >
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-5 pt-1">

              <section
                aria-labelledby="modal-cart-totals-heading"
                className="mt-4 rounded-lg border border-zinc-100 bg-zinc-50/50 p-4 dark:border-night-700/80 dark:bg-night-800/35"
              >
                <h3
                  id="modal-cart-totals-heading"
                  className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  Importes
                </h3>
                <dl className="mt-3 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-3 text-zinc-600 dark:text-zinc-400">
                    <dt>Productos</dt>
                    <dd className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 text-zinc-600 dark:text-zinc-400">
                    <dt>Envío</dt>
                    <dd className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                      {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-zinc-200/80 pt-3 text-base font-bold dark:border-night-700">
                    <dt className="text-zinc-900 dark:text-zinc-50">Total</dt>
                    <dd className="tabular-nums text-[var(--color-forest)] dark:text-[var(--color-market-dark-accent)]">
                      {formatPrice(total)}
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="modal-cart-shipping-heading"
                className="mt-4 rounded-lg border border-zinc-100 p-4 dark:border-night-700/80"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:bg-[color:rgb(21_42_94/0.55)] dark:text-[var(--color-market-dark-accent)]">
                    <FiPackage className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3
                      id="modal-cart-shipping-heading"
                      className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
                    >
                      Dirección de entrega
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      La usaremos para todos los pedidos de esta compra.
                    </p>
                    <label htmlFor="modal-cart-shipping-address" className="sr-only">
                      Dirección completa
                    </label>
                    <textarea
                      id="modal-cart-shipping-address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      rows={3}
                      placeholder="Calle, número, piso, ciudad, código postal…"
                      className={`${checkoutFieldClass} mt-3 resize-none`}
                    />
                  </div>
                </div>
              </section>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setCouponOpen((o) => !o)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-dashed border-zinc-200 px-3 py-2.5 text-left text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-night-600 dark:text-zinc-300 dark:hover:border-night-500 dark:hover:bg-night-800/50"
                  aria-expanded={couponOpen}
                >
                  <span className="flex items-center gap-2">
                    <FiTag className="h-4 w-4 text-zinc-400" aria-hidden />
                    Cupón promocional
                  </span>
                  <FiChevronDown
                    className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${couponOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                {couponOpen ? (
                  <div className="rounded-lg border border-zinc-100 bg-zinc-50/40 p-3 dark:border-night-700/60 dark:bg-night-800/25">
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Código"
                      className={checkoutFieldClass}
                      autoComplete="off"
                    />
                  </div>
                ) : null}
              </div>

              <div className="mt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => setNoteOpen((o) => !o)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-dashed border-zinc-200 px-3 py-2.5 text-left text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-night-600 dark:text-zinc-300 dark:hover:border-night-500 dark:hover:bg-night-800/50"
                  aria-expanded={noteOpen}
                >
                  <span className="flex items-center gap-2">
                    <FiMessageCircle
                      className="h-4 w-4 text-zinc-400"
                      aria-hidden
                    />
                    Nota para el repartidor{' '}
                    <span className="font-normal text-zinc-400">(opcional)</span>
                  </span>
                  <FiChevronDown
                    className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${noteOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                {noteOpen ? (
                  <div className="rounded-lg border border-zinc-100 bg-zinc-50/40 p-3 dark:border-night-700/60 dark:bg-night-800/25">
                    <label htmlFor="modal-cart-order-note" className="sr-only">
                      Nota opcional para el pedido
                    </label>
                    <textarea
                      id="modal-cart-order-note"
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      rows={2}
                      placeholder="Ej. timbre roto, dejar con portero…"
                      className={`${checkoutFieldClass} resize-none`}
                    />
                  </div>
                ) : null}
              </div>

              <div className="mt-6 border-t border-zinc-100 pt-5 dark:border-night-800">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full justify-center py-3.5 text-base font-semibold"
                  disabled={createOrder.isPending}
                  onClick={handleCheckout}
                >
                  {createOrder.isPending ? 'Procesando…' : 'Confirmar pedido'}
                </Button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
