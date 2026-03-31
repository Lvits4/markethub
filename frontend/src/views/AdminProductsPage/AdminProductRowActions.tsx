import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useDeleteProductMutation } from '../../hooks/useProductSellerMutations';

type Props = {
  productId: string;
  storeId: string;
};

export function AdminProductRowActions({ productId, storeId }: Props) {
  const deleteMut = useDeleteProductMutation(storeId);

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Link
        to={routePaths.sellerProductEdit(productId)}
        className="text-sm font-medium text-[var(--color-forest)] dark:text-emerald-400"
      >
        Editar
      </Link>
      <Button
        type="button"
        variant="ghost"
        className="text-xs text-red-600"
        disabled={deleteMut.isPending}
        onClick={() => {
          if (!window.confirm('¿Desactivar este producto?')) return;
          deleteMut.mutate(productId, {
            onSuccess: () => toast.success('Producto desactivado'),
            onError: (e) => toast.error(getErrorMessage(e)),
          });
        }}
      >
        Desactivar
      </Button>
    </div>
  );
}
