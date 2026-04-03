import type { MouseEvent } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAuth } from '../../hooks/useAuth';
import { useCartMutations } from '../../hooks/useCartMutations';
import { useFavoriteToggle } from '../../hooks/useFavoriteToggle';
import { useFavoriteCheckQuery } from '../../queries/useFavoriteCheckQuery';
import type { Product } from '../../types/product';
import { addToCartSchema } from '../../validations/addToCartSchema';
import { ProductCard } from '../ProductCard/ProductCard';

export function MarketProductCard({ item }: { item: Product }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: isFav } = useFavoriteCheckQuery(item.id, isAuthenticated);
  const { add, remove } = useFavoriteToggle(item.id);
  const { addItem } = useCartMutations();

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

  const handleAddToCart = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Inicia sesión para comprar');
      navigate(routePaths.login);
      return;
    }
    if (item.stock < 1) {
      toast.error('Sin stock');
      return;
    }
    const parsed = addToCartSchema.safeParse({
      productId: item.id,
      quantity: 1,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Datos inválidos');
      return;
    }
    try {
      await addItem.mutateAsync(parsed.data);
      toast.success('Añadido al carrito');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const addPending =
    addItem.isPending && addItem.variables?.productId === item.id;

  return (
    <ProductCard
      product={item}
      isFavorite={Boolean(isFav)}
      onToggleFavorite={handleFav}
      favoriteDisabled={add.isPending || remove.isPending}
      onAddToCart={handleAddToCart}
      addToCartDisabled={addPending || item.stock < 1}
    />
  );
}
