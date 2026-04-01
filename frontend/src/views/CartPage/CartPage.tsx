import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
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

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading, isError } = useCartQuery();
  const { updateItem, removeItem } = useCartMutations();
  const createOrder = useCreateOrderMutation();
  const [coupon, setCoupon] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

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

  const subtotal = items.reduce((acc, it) => {
    const p = it.product?.price;
    const priceNum =
      typeof p === 'string' ? Number.parseFloat(p) : Number(p ?? 0);
    return acc + (Number.isNaN(priceNum) ? 0 : priceNum * it.quantity);
  }, 0);

  const shipping = 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para confirmar el pedido');
      navigate(routePaths.login);
      return;
    }
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

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:pb-10 sm:pt-8 lg:pb-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
        Carrito
      </h1>

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
            className="font-semibold text-[var(--color-forest)] dark:text-blue-400"
          >
            Ir al catálogo
          </Link>
        </p>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,400px)] lg:items-start lg:gap-10">
          <ul className="space-y-4">
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
                      />
                    ) : null}
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
                    <p className="text-sm font-medium text-[var(--color-forest)] dark:text-blue-400">
                      {product ? formatPrice(product.price) : ''}
                    </p>
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
                        variant="ghost"
                        className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => void handleRemove(it.id)}
                        disabled={removeItem.isPending}
                      >
                        Quitar
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="lg:sticky lg:top-[5.25rem]">
            <div className="rounded-md bg-white p-6 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-night-900 dark:shadow-[var(--shadow-market-dark)] dark:ring-night-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Resumen del pedido
              </h2>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Código cupón"
                  className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[var(--color-forest)] dark:border-night-700 dark:bg-night-800/50 dark:text-zinc-100 dark:focus:border-blue-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 px-4 py-3 text-sm"
                  onClick={() =>
                    coupon.trim()
                      ? toast('Los cupones llegarán en una próxima versión')
                      : toast.error('Escribe un código')
                  }
                >
                  Aplicar
                </Button>
              </div>

              <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Dirección de envío
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                placeholder="Calle, número, ciudad, código postal…"
                className="mt-2 w-full resize-none rounded-md border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[var(--color-forest)] dark:border-night-700 dark:bg-night-800/50 dark:text-zinc-100 dark:focus:border-blue-500"
              />

              <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Nota para el pedido (opcional)
              </label>
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                rows={2}
                placeholder="Instrucciones de entrega, regalo, etc."
                className="mt-2 w-full resize-none rounded-md border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[var(--color-forest)] dark:border-night-700 dark:bg-night-800/50 dark:text-zinc-100 dark:focus:border-blue-500"
              />

              <dl className="mt-6 space-y-3 border-t border-zinc-100 pt-6 text-sm dark:border-night-800">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <dt>Productos</dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                    {formatPrice(subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <dt>Envío</dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                    {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-zinc-100 pt-3 text-base font-bold dark:border-night-800">
                  <dt className="text-zinc-900 dark:text-zinc-50">Total</dt>
                  <dd className="text-[var(--color-forest)] dark:text-blue-400">
                    {formatPrice(total)}
                  </dd>
                </div>
              </dl>

              <Button
                type="button"
                variant="primary"
                className="mt-6 w-full justify-center py-3.5"
                disabled={createOrder.isPending}
                onClick={handleCheckout}
              >
                {createOrder.isPending ? 'Procesando…' : 'Confirmar pedido'}
              </Button>
              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                Se creará un pedido por cada tienda del carrito. El pago se simula
                en el servidor.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
