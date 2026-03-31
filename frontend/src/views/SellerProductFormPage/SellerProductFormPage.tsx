import { useEffect, useState, type ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAuth } from '../../hooks/useAuth';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from '../../hooks/useProductSellerMutations';
import { useCategoriesFlatQuery } from '../../queries/useCategoriesFlatQuery';
import { useProductByIdQuery } from '../../queries/useProductByIdQuery';
import { uploadFile } from '../../requests/fileRequests';

export function SellerProductFormPage() {
  const { productId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = Boolean(productId);

  const storeIdParam = searchParams.get('storeId') ?? '';
  const { data: categories } = useCategoriesFlatQuery();
  const { data: existing, isLoading: loadingProduct } = useProductByIdQuery(
    isEdit ? productId : undefined,
  );

  const effectiveStoreId = isEdit ? existing?.storeId : storeIdParam;
  const createMut = useCreateProductMutation(
    effectiveStoreId || undefined,
  );
  const updateMut = useUpdateProductMutation(
    existing?.storeId ?? (effectiveStoreId || undefined),
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setDescription(existing.description ?? '');
    setPrice(String(existing.price));
    setStock(String(existing.stock));
    setCategoryId(existing.categoryId ?? '');
    const urls =
      existing.images?.map((i) => i.url).filter(Boolean) ?? [];
    setImageUrls(urls);
  }, [existing]);

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
    const sid = isEdit ? existing?.storeId : storeIdParam;
    if (!sid) {
      toast.error('Falta la tienda (vuelve desde la lista de productos de una tienda)');
      return;
    }

    const images =
      imageUrls.length > 0
        ? imageUrls.map((url, i) => ({ url, sortOrder: i }))
        : undefined;

    if (isEdit && productId) {
      updateMut.mutate(
        {
          id: productId,
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
            navigate(routePaths.sellerStoreProducts(sid));
          },
          onError: (e) => toast.error(getErrorMessage(e)),
        },
      );
    } else {
      createMut.mutate(
        {
          name: n,
          description: description.trim() || undefined,
          price: pr,
          stock: st,
          storeId: sid,
          categoryId: categoryId || undefined,
          images,
        },
        {
          onSuccess: () => {
            toast.success('Producto creado');
            navigate(routePaths.sellerStoreProducts(sid));
          },
          onError: (e) => toast.error(getErrorMessage(e)),
        },
      );
    }
  };

  if (isEdit && loadingProduct) {
    return (
      <p className="text-center text-sm text-zinc-500">Cargando producto…</p>
    );
  }

  if (isEdit && !existing) {
    return (
      <p className="text-center text-sm text-red-600">
        Producto no encontrado.{' '}
        <Link to={routePaths.sellerStores} className="font-semibold underline">
          Volver
        </Link>
      </p>
    );
  }

  if (!isEdit && !storeIdParam) {
    return (
      <p className="text-center text-sm text-zinc-600">
        Abre “Nuevo producto” desde una tienda.{' '}
        <Link to={routePaths.sellerStores} className="font-semibold text-[var(--color-forest)]">
          Ir a tiendas
        </Link>
      </p>
    );
  }

  const backHref =
    effectiveStoreId != null && effectiveStoreId !== ''
      ? routePaths.sellerStoreProducts(effectiveStoreId)
      : routePaths.sellerStores;

  return (
    <div>
      <div className="mb-6">
        <Link
          to={backHref}
          className="text-sm font-medium text-[var(--color-forest)] dark:text-emerald-400"
        >
          ← Volver
        </Link>
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {isEdit ? 'Editar producto' : 'Nuevo producto'}
      </h2>

      <div className="mt-6 max-w-xl space-y-4 rounded-3xl bg-white p-6 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
        <div>
          <label className="text-xs text-zinc-500">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs text-zinc-500">Precio</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500">Stock</label>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-500">Categoría</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
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
          <label className="text-xs text-zinc-500">Imágenes (subir archivo)</label>
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
                    className="shrink-0 text-red-600"
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
        <Button
          type="button"
          variant="primary"
          className="w-full justify-center"
          disabled={createMut.isPending || updateMut.isPending}
          onClick={submit}
        >
          {createMut.isPending || updateMut.isPending
            ? 'Guardando…'
            : isEdit
              ? 'Actualizar'
              : 'Crear'}
        </Button>
      </div>
    </div>
  );
}
