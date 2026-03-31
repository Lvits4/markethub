import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { QuantitySelector } from '../../components/QuantitySelector/QuantitySelector';
import { routePaths } from '../../config/routes';
import { formatPrice } from '../../helpers/formatPrice';
import { getErrorMessage } from '../../helpers/mapApiError';
import { getPrimaryImageUrl } from '../../helpers/productImageUrl';
import { useCartMutations } from '../../hooks/useCartMutations';
import { useCartQuery } from '../../queries/useCartQuery';
import { updateCartItemSchema } from '../../validations/updateCartItemSchema';

export function CartPage() {
  const { data: cart, isLoading, isError } = useCartQuery();
  const { updateItem, removeItem } = useCartMutations();

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

  return (
    <div className="mx-auto max-w-lg px-4 pt-10">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
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
            className="font-semibold text-[var(--color-forest)] dark:text-emerald-400"
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
                  className="flex gap-4 rounded-md bg-white p-3 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
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
                    <p className="text-sm text-[var(--color-forest)] dark:text-emerald-400">
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
          <div className="mt-8 rounded-md bg-white p-5 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Checkout no está disponible en esta versión; revisa el carrito y
              cantidades desde aquí.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
