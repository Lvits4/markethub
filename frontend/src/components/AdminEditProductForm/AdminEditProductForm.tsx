import { useEffect, useState, type ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../Button/Button';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAuth } from '../../hooks/useAuth';
import { useUpdateProductMutation } from '../../hooks/useProductSellerMutations';
import { useCategoriesFlatQuery } from '../../queries/useCategoriesFlatQuery';
import { uploadFile } from '../../requests/fileRequests';
import type { Product } from '../../types/product';

const fieldClass =
  'mt-0.5 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/20 dark:border-night-700 dark:bg-night-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20';

const labelClass = 'text-xs font-medium text-zinc-600 dark:text-zinc-300';

export type AdminEditProductFormProps = {
  product: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function AdminEditProductForm({
  product,
  onSuccess,
  onCancel,
}: AdminEditProductFormProps) {
  const { token } = useAuth();
  const updateMut = useUpdateProductMutation(product.storeId);
  const { data: categories } = useCategoriesFlatQuery();

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? '');
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [categoryId, setCategoryId] = useState(product.categoryId ?? '');
  const [imageUrls, setImageUrls] = useState<string[]>(
    product.images?.map((i) => i.url).filter(Boolean) ?? [],
  );
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setName(product.name);
    setDescription(product.description ?? '');
    setPrice(String(product.price));
    setStock(String(product.stock));
    setCategoryId(product.categoryId ?? '');
    setImageUrls(product.images?.map((i) => i.url).filter(Boolean) ?? []);
  }, [product]);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const res = await uploadFile(token, file, 'products');
      setImageUrls((prev) => [...prev, res.url]);
      toast.success('Imagen subida');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const submit = () => {
    const n = name.trim();
    const pr = Number.parseFloat(price.replace(',', '.'));
    const st = Number.parseInt(stock, 10);
    if (!n) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!Number.isFinite(pr) || pr < 0) {
      toast.error('Precio inválido');
      return;
    }
    if (!Number.isFinite(st) || st < 0) {
      toast.error('Stock inválido');
      return;
    }

    const images =
      imageUrls.length > 0
        ? imageUrls.map((url, i) => ({ url, sortOrder: i }))
        : undefined;

    updateMut.mutate(
      {
        id: product.id,
        body: {
          name: n,
          description: description.trim() || undefined,
          price: pr,
          stock: st,
          categoryId: categoryId || undefined,
          images,
        },
      },
      {
        onSuccess: () => {
          toast.success('Producto actualizado');
          onSuccess?.();
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  return (
    <div className="space-y-5 px-5 py-4">
      <div>
        <label className={labelClass}>Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass}>Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`${fieldClass} resize-none`}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Precio</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Stock</label>
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Categoría</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={fieldClass}
        >
          <option value="">—</option>
          {(categories ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Imágenes (subir archivo)</label>
        <input
          type="file"
          accept="image/*"
          disabled={uploading || !token}
          onChange={(e) => void handleUpload(e)}
          className="mt-1 block w-full text-sm"
        />
        {imageUrls.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs text-zinc-500">
            {imageUrls.map((u) => (
              <li key={u} className="flex items-center justify-between gap-2">
                <span className="truncate font-mono">{u}</span>
                <button
                  type="button"
                  className="shrink-0 cursor-pointer text-red-600"
                  onClick={() =>
                    setImageUrls((prev) => prev.filter((x) => x !== u))
                  }
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4 dark:border-night-800">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            className="h-10 px-4 text-sm"
            onClick={onCancel}
            disabled={updateMut.isPending}
          >
            Cancelar
          </Button>
        ) : null}
        <Button
          type="button"
          variant="primary"
          className="h-10 px-6 text-sm"
          disabled={updateMut.isPending}
          onClick={submit}
        >
          {updateMut.isPending ? 'Guardando…' : 'Actualizar'}
        </Button>
      </div>
    </div>
  );
}
